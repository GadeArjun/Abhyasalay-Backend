const mongoose = require("mongoose");

const analysisLogSchema = new mongoose.Schema(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    lastAnalyzedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

analysisLogSchema.index({ testId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("AnalysisLog", analysisLogSchema);
