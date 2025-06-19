const Class = require("../models/Class");

// ✅ Create a new class
exports.createClass = async (req, res) => {
  try {
    const { name, teacherId } = req.body;

    if (!name || !teacherId) {
      return res
        .status(400)
        .json({ message: "Name and teacherId are required." });
    }

    const newClass = new Class({ name, teacherId });
    const savedClass = await newClass.save();

    res
      .status(201)
      .json({ message: "Class created successfully", data: savedClass });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Server error while creating class" });
  }
};

// ✅ Get all classes (optionally filter by teacherId)
exports.getAllClasses = async (req, res) => {
  try {
    const { teacherId } = req.query;
    const filter = teacherId ? { teacherId } : {teacherId:""};

    const classes = await Class.find(filter).populate("teacherId");

    res
      .status(200)
      .json({ message: "Classes fetched successfully", data: classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Server error while fetching classes" });
  }
};

// ✅ Get one class by _id
exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findById(id).populate(
      "teacherId",);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    res
      .status(200)
      .json({ message: "Class fetched successfully", data: classData });
  } catch (error) {
    console.error("Error fetching class by id:", error);
    res.status(500).json({ message: "Server error while fetching class" });
  }
};

// ✅ Update class by _id
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, teacherId } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { name, teacherId },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res
      .status(200)
      .json({ message: "Class updated successfully", data: updatedClass });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ message: "Server error while updating class" });
  }
};

// ✅ Delete class by _id
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ message: "Server error while deleting class" });
  }
};
