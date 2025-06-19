const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// Create JWT token
const signToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET);
};

// --------------------
// @desc: Login Handler
// @route: POST /api/auth/login
// --------------------
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Basic input validation
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password and role are required." });
    }

    const Model =
      role === "teacher" ? Teacher : role === "student" ? Student : null;

    if (!Model) {
      return res.status(400).json({
        message: "Invalid role provided. Must be 'teacher' or 'student'.",
      });
    }

    const user =
      role === "teacher"
        ? await Model.findOne({ email })
        : await Model.findOne({ email }).populate("teacherId");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const token = signToken(user._id, role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        // id: user._id,
        // fullName: user.fullName,
        // email: user.email,
        // role,
        userData: user,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
