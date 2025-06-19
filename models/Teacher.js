const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teacherSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    // dob: { type: Date },
    contactNumber: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    role: { type: String, default: "teacher", required: true },
    school: {
      name: String,
      city: String,
      state: String,
      pincode: String,
    },

    password: { type: String, required: true },

    qualifications: [String],
    profilePic: { type: String }, // Optional: photo URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
