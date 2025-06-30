// const mongoose = require("mongoose");

// const jobQueueSchema = new mongoose.Schema(
//   {
//     question: { type: String, required: true },
//     answer: { type: String, required: true },
//     testId: { type: mongoose.Schema.Types.ObjectId, required: true },
//     studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
//     status: {
//       type: String,
//       enum: ["pending", "processing", "completed", "failed"],
//       default: "pending",
//     },
//     error: { type: String, default: null },
//     retries: { type: Number, default: 0 },
//     scheduledAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// jobQueueSchema.index({ status: 1, scheduledAt: 1 });

// module.exports = mongoose.model("JobQueue", jobQueueSchema);

// models/JobQueue.js


const mongoose = require("mongoose");

const jobQueueSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    testId: mongoose.Schema.Types.ObjectId,
    studentId: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    retries: { type: Number, default: 0 },
    error: String,
    scheduledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobQueue", jobQueueSchema);
