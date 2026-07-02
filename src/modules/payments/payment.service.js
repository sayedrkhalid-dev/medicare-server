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
  | Duplicate Booking
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

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;

    default:
      break;
  }
};

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
    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Create Payment
  |--------------------------------------------------------------------------
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
  });

  /*
  |--------------------------------------------------------------------------
  | Create Appointment
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Link Payment
  |--------------------------------------------------------------------------
  */

  payment.appointmentId = appointment._id;

  await payment.save();
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
    | Stripe confirms paid, but our webhook hasn't landed yet.
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
  getMyPayments,
  getPaymentById,
  getPayments,
};
