const express = require("express");
const router = express.Router();
const {
  saveDeviceToken,
  deleteDeviceToken,
} = require("../controllers/deviceTokenController");

// Save or update token
router.post("/", saveDeviceToken);

// Optionally delete token
router.delete("/:userId", deleteDeviceToken);

module.exports = router;
