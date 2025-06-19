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

    // bgColor: {
    //   type: String,
    //   default: "#F3F4F6", // Default light gray
    // },

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
