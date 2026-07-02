const createHttpError = require("http-errors");

const stripe = require("../../lib/stripe");

const Payment = require("./payment.model");

const Doctor = require("../doctors/doctor.model");
const Appointment = require("../appointments/appointment.model");

const appointmentService = require("../appointments/appointment.service");

const {
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_CURRENCY,
} = require("./payment.constants");

const createCheckoutSession = async (patientId, payload) => {
  /*
  |--------------------------------------------------------------------------
  | Doctor
  |--------------------------------------------------------------------------
  */

  const doctor = await Doctor.findById(payload.doctorId);

  if (!doctor) {
    throw createHttpError(404, "Doctor not found");
  }

  if (doctor.status !== "approved") {
    throw createHttpError(400, "Doctor is not available");
  }

  /*
  |--------------------------------------------------------------------------
  | Duplicate Booking (same patient, same slot)
  |--------------------------------------------------------------------------
  */

  const existingAppointment = await Appointment.findOne({
    patientId,
    doctorId: doctor._id,
    appointmentDate: new Date(payload.appointmentDate),
    appointmentTime: payload.appointmentTime,
    appointmentStatus: {
      $ne: "cancelled",
    },
  });

  if (existingAppointment) {
    throw createHttpError(409, "Appointment already exists.");
  }

  /*
  |--------------------------------------------------------------------------
  | Slot Availability (any patient)
  |--------------------------------------------------------------------------
  | Without this check, a patient could pay for a slot that's already
  | taken by someone else, or that doesn't exist on the doctor's active
  | schedule at all -- and the failure would only surface *after* the
  | charge, inside the webhook, with no way to stop the payment. Checking
  | here doesn't fully eliminate the race (two patients could still both
  | pass this check within the same instant and then race to checkout),
  | but it closes the overwhelmingly common case: booking a slot that was
  | already gone well before this request, or one that was never valid
  | to begin with.
  */

  const availableSlots = await appointmentService.getAvailableSlots(
    payload.doctorId,
    payload.appointmentDate,
  );

  if (!availableSlots.includes(payload.appointmentTime)) {
    throw createHttpError(
      400,
      "Selected slot is no longer available. Please choose a different time.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Stripe Checkout Session
  |--------------------------------------------------------------------------
  */

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    line_items: [
      {
        quantity: 1,

        price_data: {
          currency: PAYMENT_CURRENCY.BDT,

          unit_amount: Math.round(doctor.consultationFee * 100),

          product_data: {
            name: "Doctor Consultation",

            description: doctor.specialization,
          },
        },
      },
    ],

    success_url:
      `${process.env.BASE_APP_URL}/payment/success` +
      "?session_id={CHECKOUT_SESSION_ID}",

    cancel_url: `${process.env.BASE_APP_URL}/payment/cancel`,

    metadata: {
      patientId: patientId.toString(),

      doctorId: doctor._id.toString(),

      appointmentDate: payload.appointmentDate,

      appointmentTime: payload.appointmentTime,

      symptoms: payload.symptoms || "",
    },
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
  };
};

const handleWebhook = async (req) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("[payments/webhook] signature verification failed:", error.message);
    throw error;
  }

  console.log(`[payments/webhook] received event: ${event.type} (${event.id})`);

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;

    default:
      break;
  }
};

/**
 * Finalize a completed Stripe Checkout session.
 *
 * IMPORTANT DESIGN NOTE: the Payment record is ALWAYS created and saved
 * first, on its own, *before* attempting to create the Appointment. This
 * is intentional -- the Stripe charge has already happened by this point,
 * so we must have a durable record of it no matter what happens next.
 *
 * (An earlier version of this function wrapped both writes in a single
 * Mongo transaction so a failed appointment would roll back the payment
 * too -- but that meant a failed appointment left literally zero trace
 * in the database: money charged, nothing to debug, nothing to
 * reconcile. That's worse than an orphaned "succeeded" payment with a
 * null appointmentId, which reconcilePayment() below can recover from.)
 *
 * If appointment creation fails, we log the exact inputs (doctorId,
 * requested date/time, computed day-of-week, and the list of slots the
 * system considered available) so the failure is diagnosable from the
 * Render logs alone, without needing to reproduce it.
 */
const handleCheckoutCompleted = async (session) => {
  /*
  |--------------------------------------------------------------------------
  | Prevent Duplicate Processing
  |--------------------------------------------------------------------------
  */

  const exists = await Payment.findOne({
    stripeSessionId: session.id,
  });

  if (exists) {
    console.log(
      `[payments/webhook] payment already recorded for session ${session.id}, skipping`,
    );
    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Create Payment (always -- the charge already happened)
  |--------------------------------------------------------------------------
  | Metadata is persisted on the Payment doc itself so a stuck/failed
  | payment can later be reconciled without depending on the Stripe
  | session still being retrievable (Checkout Sessions expire).
  */

  const payment = await Payment.create({
    patientId: session.metadata.patientId,

    doctorId: session.metadata.doctorId,

    amount: session.amount_total / 100,

    currency: session.currency,

    paymentMethod: PAYMENT_METHOD.STRIPE,

    transactionId: session.payment_intent,

    stripeSessionId: session.id,

    stripePaymentIntentId: session.payment_intent,

    status: PAYMENT_STATUS.SUCCEEDED,

    paidAt: new Date(),

    metadata: {
      doctorId: session.metadata.doctorId,
      appointmentDate: session.metadata.appointmentDate,
      appointmentTime: session.metadata.appointmentTime,
      symptoms: session.metadata.symptoms || "",
    },
  });

  console.log(
    `[payments/webhook] payment ${payment._id} recorded for session ${session.id}, attempting appointment creation`,
  );

  /*
  |--------------------------------------------------------------------------
  | Create Appointment (best-effort; payment above is already safe)
  |--------------------------------------------------------------------------
  */

  try {
    const appointment = await appointmentService.createAppointmentAfterPayment(
      session.metadata.patientId,
      payment._id,
      {
        doctorId: session.metadata.doctorId,

        appointmentDate: session.metadata.appointmentDate,

        appointmentTime: session.metadata.appointmentTime,

        symptoms: session.metadata.symptoms,
      },
    );

    payment.appointmentId = appointment._id;
    await payment.save();

    console.log(
      `[payments/webhook] appointment ${appointment._id} created and linked to payment ${payment._id}`,
    );
  } catch (error) {
    /*
    |------------------------------------------------------------------------
    | DEBUG: dump exactly what was requested vs. what the system computed
    | as available, so a "Selected slot is unavailable" failure is
    | diagnosable straight from the logs.
    |------------------------------------------------------------------------
    */
    let debugSlots = null;
    try {
      debugSlots = await appointmentService.getAvailableSlots(
        session.metadata.doctorId,
        session.metadata.appointmentDate,
      );
    } catch (slotsError) {
      debugSlots = `<getAvailableSlots itself threw: ${slotsError.message}>`;
    }

    console.error(
      `[payments/webhook] appointment creation FAILED for payment ${payment._id} (session ${session.id}):`,
      error.message,
    );
    console.error(
      `[payments/webhook] debug context -> doctorId: ${session.metadata.doctorId}, ` +
        `requestedDate: ${session.metadata.appointmentDate}, ` +
        `requestedTime: ${session.metadata.appointmentTime}, ` +
        `computedAvailableSlots: ${JSON.stringify(debugSlots)}`,
    );

    // Payment is preserved as-is (status: succeeded, appointmentId: null).
    // Use POST /payments/:id/reconcile once the underlying issue is fixed.
    throw error;
  }
};

/**
 * Verify Checkout Session
 *
 * Used by the frontend success page to poll until the webhook has
 * finished creating the Payment + Appointment records. Stripe redirects
 * the browser to the success_url immediately on payment, but the webhook
 * that actually persists the booking runs asynchronously and may land a
 * second or two later (or, rarely, much later).
 */
const verifyCheckoutSession = async (sessionId, patientId) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    throw createHttpError(404, "Checkout session not found");
  }

  if (session.metadata.patientId !== patientId.toString()) {
    throw createHttpError(403, "This session does not belong to you");
  }

  if (session.payment_status !== "paid") {
    return {
      status: "pending",
      paymentStatus: session.payment_status,
    };
  }

  const payment = await Payment.findOne({
    stripeSessionId: session.id,
  }).populate("appointmentId");

  if (!payment || !payment.appointmentId) {
    /*
    |------------------------------------------------------------------------
    | Stripe confirms paid, but our webhook hasn't landed yet (or landed
    | and failed before this fix -- see reconcilePayment for that case).
    | The frontend should keep polling for a few seconds.
    |------------------------------------------------------------------------
    */
    return {
      status: "processing",
    };
  }

  return {
    status: "success",
    payment,
    appointment: payment.appointmentId,
  };
};

/**
 * Reconcile a Payment that's stuck as "succeeded" with no linked
 * appointment -- i.e. the webhook charged the card but appointment
 * creation failed partway through (this was possible before the
 * transaction fix above, and could theoretically still happen if
 * `createAppointmentAfterPayment` keeps failing on every retry, e.g.
 * because of a persistent slot conflict).
 *
 * Admin-triggered: POST /payments/:id/reconcile
 */
const reconcilePayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw createHttpError(404, "Payment not found");
  }

  if (payment.appointmentId) {
    return { alreadyReconciled: true, payment };
  }

  if (payment.status !== PAYMENT_STATUS.SUCCEEDED) {
    throw createHttpError(
      400,
      "Only succeeded payments without an appointment can be reconciled",
    );
  }

  let doctorId, appointmentDate, appointmentTime, symptoms;

  if (payment.metadata && payment.metadata.appointmentDate) {
    ({ doctorId, appointmentDate, appointmentTime, symptoms } = payment.metadata);
  } else if (payment.stripeSessionId) {
    /*
    |------------------------------------------------------------------------
    | Fallback for payments created before this fix, whose metadata was
    | never saved onto the Payment doc. Stripe Checkout Sessions are
    | retrievable for a limited window after creation -- if it's expired,
    | this will throw and the payment must be reconciled manually.
    |------------------------------------------------------------------------
    */
    const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);
    ({ doctorId, appointmentDate, appointmentTime, symptoms } = session.metadata);
  } else {
    throw createHttpError(422, "No metadata available to reconcile this payment");
  }

  const appointment = await appointmentService.createAppointmentAfterPayment(
    payment.patientId,
    payment._id,
    { doctorId, appointmentDate, appointmentTime, symptoms },
  );

  payment.appointmentId = appointment._id;
  await payment.save();

  console.log(
    `[payments/reconcile] payment ${payment._id} linked to appointment ${appointment._id}`,
  );

  return { alreadyReconciled: false, payment, appointment };
};

/**
 * Build a Mongo status filter.
 *
 * The admin/patient UIs group related statuses together (e.g. "Pending"
 * covers both "pending" and "processing", "Failed" covers both "failed"
 * and "cancelled"). The frontend sends these as a comma-separated list
 * (e.g. "pending,processing"), so support both a single value and a list.
 */
const buildStatusFilter = (statusParam) => {
  if (!statusParam) return undefined;

  const values = String(statusParam)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (values.length === 0) return undefined;

  return values.length === 1 ? values[0] : { $in: values };
};

/**
 * Get My Payments (Patient)
 */
const getMyPayments = async (patientId, query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);

  const filter = { patientId };

  const statusFilter = buildStatusFilter(query.status);
  if (statusFilter) {
    filter.status = statusFilter;
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("doctorId", "specialization consultationFee hospital")
      .populate("appointmentId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get Payment By ID
 *
 * Patients may only view their own payment; admins may view any.
 */
const getPaymentById = async (paymentId, user) => {
  const payment = await Payment.findById(paymentId)
    .populate("doctorId", "specialization consultationFee hospital")
    .populate("appointmentId")
    .populate("patientId", "name email role");

  if (!payment) {
    throw createHttpError(404, "Payment not found");
  }

  const isOwner = payment.patientId._id.toString() === user.id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw createHttpError(403, "You do not have access to this payment");
  }

  return payment;
};

/**
 * Get All Payments (Admin)
 */
const getPayments = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);

  const filter = {};

  const statusFilter = buildStatusFilter(query.status);
  if (statusFilter) {
    filter.status = statusFilter;
  }

  if (query.patientId) {
    filter.patientId = query.patientId;
  }

  if (query.doctorId) {
    filter.doctorId = query.doctorId;
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("doctorId", "specialization consultationFee hospital")
      .populate("patientId", "name email")
      .populate("appointmentId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  verifyCheckoutSession,
  reconcilePayment,
  getMyPayments,
  getPaymentById,
  getPayments,
};