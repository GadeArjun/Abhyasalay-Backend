const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: { type: Date },
    contactNumber: { type: String },
    email: {
      type: String,
      unique: true,
      sparse: true, // <-- important
      trim: true, // optional
    },
    address: { type: String },
    role: { type: String, default: "student", required: true },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    password: { type: String },

    guardian: {
      name: String,
      contact: String,
    },

    profilePic: { type: String }, // Optional: profile photo URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
