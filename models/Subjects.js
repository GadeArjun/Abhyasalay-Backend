const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    }, // e.g., "Mathematics", "Science"

    icon: {
      type: String,
      default: "book-outline", // Optional icon for UI
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },

    description: {
      type: String,
      default: "",
    },
    units: [
      {
        unitNo: { type: Number },
        unitName: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
