const mongoose = require("mongoose");

const DeviceTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  token: { type: String, required: true },
});

module.exports = mongoose.model("DeviceToken", DeviceTokenSchema);
