const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      enum: ["assigned_test", "test_submitted"],
      required: true,
    },
    message: { type: String, required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "AssignTest" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
