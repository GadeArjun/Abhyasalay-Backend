const Subject = require("../models/Subjects");
const Class = require("../models/Class");
const Teacher = require("../models/Teacher");

// 1. CREATE a new subject
exports.createSubject = async (req, res) => {
  try {
    const { name, icon, classId, teacherId, description } = req.body;
    if (!name || !classId) {
      return res
        .status(400)
        .json({ message: "Name and Class ID are required" });
    }

    // Optional: validate if classId exists
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const subject = new Subject({
      name,
      icon,
      classId,
      teacherId,
      description,
    });

    const savedSubject = await subject.save();
    return res
      .status(201)
      .json({ message: "Subject created", data: savedSubject });
  } catch (err) {
    console.error("Error creating subject:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 2. GET all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("classId")
      .populate("teacherId");
    return res.status(200).json(subjects);
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 3. GET subject by _id
exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id)
      .populate("classId")
      .populate("teacherId");
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.status(200).json(subject);
  } catch (err) {
    console.error("Error fetching subject:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 4. GET all subjects by classId
exports.getSubjectsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    const subjects = await Subject.find({ classId }).populate("teacherId");
    return res.status(200).json(subjects);
  } catch (err) {
    console.error("Error fetching subjects by class:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 5. UPDATE subject by _id
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, classId, teacherId, description } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Optional: validate if class exists
    if (classId) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(404).json({ message: "Class not found" });
      }
    }

    subject.name = name ?? subject.name;
    subject.icon = icon ?? subject.icon;
    subject.classId = classId ?? subject.classId;
    subject.teacherId = teacherId ?? subject.teacherId;
    subject.description = description ?? subject.description;

    const updated = await subject.save();
    return res.status(200).json({ message: "Subject updated", data: updated });
  } catch (err) {
    console.error("Error updating subject:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 6. DELETE subject by _id
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Subject.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Subject not found or already deleted" });
    }

    return res.status(200).json({ message: "Subject deleted", data: deleted });
  } catch (err) {
    console.error("Error deleting subject:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
