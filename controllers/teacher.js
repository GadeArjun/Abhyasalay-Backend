const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");

// ------------------------
// Create a New Teacher
// POST /api/teachers
// ------------------------
exports.createTeacher = async (req, res) => {
  try {
    const data = req.body;

    if (!data.fullName || !data.email || !data.password) {
      return res
        .status(400)
        .json({ message: "Full name, email, and password are required." });
    }

    // Check if teacher already exists
    const existing = await Teacher.findOne({ email: data.email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Teacher with this email already exists." });
    }

    // Hash password
    data.password = await bcrypt.hash(data.password, 10);
    const teacher = await Teacher.create(data);
    const response = teacher.toObject();
    delete response.password;

    res.status(201).json(response);
  } catch (error) {
    console.error("Create Teacher Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------
// Get All Teachers
// GET /api/teachers
// ------------------------
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select("-password");
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Get All Teachers Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------
// Get Single Teacher by ID
// GET /api/teachers/:id
// ------------------------
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("-password");
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json(teacher);
  } catch (error) {
    console.error("Get Teacher By ID Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------
// Update Teacher
// PUT /api/teachers/:id
// ------------------------
exports.updateTeacher = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json(teacher);
  } catch (error) {
    console.error("Update Teacher Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------
// Delete Teacher
// DELETE /api/teachers/:id
// ------------------------
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Delete Teacher Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
