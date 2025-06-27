const DeviceToken = require('../models/DeviceToken');

// Save or update device token
exports.saveDeviceToken = async (req, res) => {
  const { userId, token } = req.body;

  console.log({ userId, token });

  if (!userId || !token) {
    return res.status(400).json({ success: false, message: 'userId and token are required' });
  }

  try {
    const existing = await DeviceToken.findOne({ userId });

    console.log({ existing });

    if (existing) {
      // Update token
      existing.token = token;
      await existing.save();
      return res.status(200).json({ success: true, message: 'Device token updated' });
    }

    // Create new token
    const newToken = new DeviceToken({ userId, token });
    await newToken.save();
    res.status(201).json({ success: true, message: 'Device token saved' });
  } catch (error) {
    console.error('Error saving device token:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Optionally delete a token
exports.deleteDeviceToken = async (req, res) => {
  const { userId } = req.params;

  try {
    await DeviceToken.deleteOne({ userId });
    res.status(200).json({ success: true, message: 'Device token deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
