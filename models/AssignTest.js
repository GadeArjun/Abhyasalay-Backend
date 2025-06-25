const mongoose = require("mongoose");

const assignTestSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class", // Linked class
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["file", "text", "quiz"],
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    files: [
      {
        name: { type: String, required: true },
        uri: { type: String, required: true },
        mimeType: { type: String },
        size: { type: Number },
      },
    ],

    note: {
      type: String,
      default: "",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    quizQuestions: [
      {
        question: String,
        options: [String],
        // correctAnswerIndex: Number,
        correctAnswer: Number,
      },
    ],
    studentStatus: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        studentName: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "seen", "submitted", "late"],
          default: "pending",
        },
        submittedAt: {
          type: Date,
        },
        marksObtained: {
          type: Number,
          default: 0,
        },
        submission: {
          textAnswer: { type: String },
          fileUrl: [
            {
              name: { type: String },
              url: { type: String },
              mimeType: { type: String },
              size: { type: Number },
            },
          ],
          quizAnswers: [{ type: Number }], // index of selected options
        },
        feedback: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AssignTest", assignTestSchema);
