const Doctor = require("./doctor.model");

const getAllDoctors = async (query) => {
  const { specialization, hospital, minFee, maxFee, searchTerm } = query;

  const filter = {
    status: "approved",
  };

  if (specialization) {
    filter.specialization = specialization;
  }

  if (hospital) {
    filter.hospital = {
      $regex: hospital,
      $options: "i",
    };
  }

  if (minFee || maxFee) {
    filter.consultationFee = {};

    if (minFee) {
      filter.consultationFee.$gte = Number(minFee);
    }

    if (maxFee) {
      filter.consultationFee.$lte = Number(maxFee);
    }
  }

  if (searchTerm) {
    filter.$or = [
      {
        hospital: {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        specialization: {
          $regex: searchTerm,
          $options: "i",
        },
      },
    ];
  }

  return await Doctor.find(filter).sort({
    rating: -1,
    reviewCount: -1,
  });
};

const getDoctorById = async (doctorId) => {
  return await Doctor.findById(doctorId);
};

const getDoctorProfileByUserId = async (userId) => {
  return await Doctor.findOne({
    userId,
  });
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
