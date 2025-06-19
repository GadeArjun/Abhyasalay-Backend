const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// CREATE a new student
exports.createStudent = async (req, res) => {
  try {
    const { fullName, rollNumber, classId, teacherId, password, ...rest } =
      req.body;
  
    if (!fullName || !rollNumber || !classId || !teacherId) {
      return res
        .status(400)
        .json({ message: "Full Name and  Roll Number are required" });
    }

    if (password) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = await Student.findOne({ rollNumber, classId });
    if (existing) {
      return res
        .status(409)
        .json({
          message: "Student with this rollNumber already exists in this class",
        });
    }

    const studentData = { fullName, rollNumber, classId, teacherId, ...rest };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      studentData.password = await bcrypt.hash(password, salt);
    }

    const student = await Student.create(studentData);
    return res.status(201).json({ message: "Student created", student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET all students (optional filters)
exports.getStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.teacherId) filter.teacherId = req.query.teacherId;
    if (req.query.classId) filter.classId = req.query.classId;
    const students = await Student.find(filter)
      .select("fullName rollNumber classId teacherId")
      .lean()
      .exec();

    return res.json({ count: students.length, students });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET student by _id
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).populate("teacherId").select("-__v").lean().exec();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    console.log(student.teacherId);

    return res.json({ student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// UPDATE student by _id
exports.updateStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updated = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-__v");
    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({ message: "Student updated", student: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE student by _id
exports.deleteStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id).exec();
    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.json({ message: "Student deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
