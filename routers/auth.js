const express = require("express");
const { login } = require("../controllers/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

module.exports = {
  authRouters: router,
};
