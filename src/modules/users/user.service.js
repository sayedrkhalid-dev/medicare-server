// Third-party dependencies
const createHttpError = require("http-errors");
const { ObjectId } = require("mongodb");

// Internal dependencies
const { getDB } = require("../../config/db");

/**
 * Select only public user fields
 */
const USER_PROJECTION = {
  password: 0,
};

/**
 * Get logged-in user profile
 */
const getMe = async (userId) => {
  const db = getDB();

  const user = await db.collection("user").findOne(
    {
      _id: new ObjectId(userId),
    },
    {
      projection: USER_PROJECTION,
    },
  );

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user;
};

/**
 * Update own profile
 */
const updateProfile = async (userId, payload) => {
  const db = getDB();

  const allowedFields = {
    name: payload.name,
    image: payload.image,
    gender: payload.gender,
    phone: payload.phone,
    address: payload.address,
    dateOfBirth: payload.dateOfBirth,
  };

  Object.keys(allowedFields).forEach((key) => {
    if (allowedFields[key] === undefined) {
      delete allowedFields[key];
    }
  });

  await db.collection("user").updateOne(
    {
      _id: new ObjectId(userId),
    },
    {
      $set: allowedFields,
    },
  );

  return getMe(userId);
};

/**
 * Get all users with pagination, search and filters
 */
const getAllUsers = async (page = 1, limit = 10, search, role, status) => {
  const db = getDB();

  const skip = (page - 1) * limit;

  const query = {};

  if (search) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  const users = await db
    .collection("user")
    .find(query, {
      projection: USER_PROJECTION,
    })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection("user").countDocuments(query);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  };
};

/**
 * Get user by id
 */
const getUserById = async (userId) => {
  const db = getDB();

  const user = await db.collection("user").findOne(
    {
      _id: new ObjectId(userId),
    },
    {
      projection: USER_PROJECTION,
    },
  );

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user;
};

/**
 * Suspend user
 */
const suspendUser = async (targetUserId, currentUserId) => {
  if (targetUserId === currentUserId) {
    throw createHttpError(400, "You cannot suspend your own account");
  }

  const db = getDB();

  const user = await db.collection("user").findOne({
    _id: new ObjectId(targetUserId),
  });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  await db.collection("user").updateOne(
    {
      _id: new ObjectId(targetUserId),
    },
    {
      $set: {
        status: "suspended",
      },
    },
  );

  return getUserById(targetUserId);
};

/**
 * Activate user
 */
const activateUser = async (userId) => {
  const db = getDB();

  const user = await db.collection("user").findOne({
    _id: new ObjectId(userId),
  });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  await db.collection("user").updateOne(
    {
      _id: new ObjectId(userId),
    },
    {
      $set: {
        status: "active",
      },
    },
  );

  return getUserById(userId);
};

module.exports = {
  getMe,
  updateProfile,
  getAllUsers,
  getUserById,
  suspendUser,
  activateUser,
};
