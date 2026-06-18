const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email address is required!"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required!"],
      trim: true,
    },

    gender: {
      type: String,
      required: [true, "Gender is required!"],
      enum: ["male", "female", "other"],
    },

    photoURL: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      required: [true, "Role is required!"],
      enum: ["patient", "doctor", "admin"],
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
