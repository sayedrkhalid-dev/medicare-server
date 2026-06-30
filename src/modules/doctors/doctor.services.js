const Doctor = require("./doctor.model");
const { ObjectId } = require("mongodb");
const { getDB } = require("../../config/db");

const attachUser = async (doctor) => {
  const db = getDB();

  // Check if doctor has userId
  if (!doctor.userId) {
    return {
      ...doctor,
      user: null,
    };
  }

  // Convert userId to ObjectId if it's a string
  const userId =
    typeof doctor.userId === "string"
      ? new ObjectId(doctor.userId)
      : doctor.userId;

  try {
    const user = await db.collection("user").findOne({
      _id: userId,
    });

    return {
      ...doctor,
      user: user || null, // Attach user data or null if not found
    };
  } catch (error) {
    console.error(`Error fetching user for doctor ${doctor._id}:`, error);
    return {
      ...doctor,
      user: null,
    };
  }
};

const getAllDoctors = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    searchTerm,
    specialization,
    hospital,
    minFee,
    maxFee,
  } = queryParams;

  // Base filter on fields that actually live on the Doctor document
  const filter = { status: "approved" };

  if (specialization) filter.specialization = specialization;
  if (hospital) filter.hospital = { $regex: hospital, $options: "i" };

  if (minFee || maxFee) {
    filter.consultationFee = {};
    if (minFee) filter.consultationFee.$gte = Number(minFee);
    if (maxFee) filter.consultationFee.$lte = Number(maxFee);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // name/email live on the User collection, not on Doctor, so a plain
  // Doctor.find() can never match them. Join with "user" via $lookup so
  // searchTerm can match across both the doctor's own fields (hospital,
  // specialization) and the joined user's fields (name, email).
  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: "user",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  ];

  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { hospital: { $regex: searchTerm, $options: "i" } },
          { specialization: { $regex: searchTerm, $options: "i" } },
          { "user.name": { $regex: searchTerm, $options: "i" } },
          { "user.email": { $regex: searchTerm, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limitNum }],
      totalCount: [{ $count: "count" }],
    },
  });

  const [result] = await Doctor.aggregate(pipeline);

  const doctors = result?.data || [];
  const total = result?.totalCount?.[0]?.count || 0;

  return {
    doctors,
    pagination: {
      page: parseInt(page),
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const getDoctorById = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).lean();
  if (!doctor) return null;

  // Attach user data
  return await attachUser(doctor);
};

const getDoctorProfileByUserId = async (userId) => {
  const doctor = await Doctor.findOne({ userId }).lean();
  if (!doctor) return null;

  // Attach user data
  return await attachUser(doctor);
};

const suspendDoctor = async (doctorId) => {
  return await Doctor.findByIdAndUpdate(
    doctorId,
    {
      status: "suspended",
    },
    {
      new: true,
    },
  );
};

const activateDoctor = async (doctorId) => {
  return await Doctor.findByIdAndUpdate(
    doctorId,
    {
      status: "approved",
    },
    {
      new: true,
    },
  );
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorProfileByUserId,
  suspendDoctor,
  activateDoctor,
};
