// controllers/assignTest.controller.js

const mongoose = require("mongoose");
const AssignTest = require("../models/AssignTest");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const path = require("path");
// Handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


exports.uploadFilesAndCreateTest = async (req, res) => {
  try {
    console.log(req.files,"files");
    const uploaded = await Promise.all(
      (req.files || []).map((f) =>
        cloudinary.uploader
          .upload(f.path, { folder: "assignTests", resource_type: "auto" })
          .then((r) => {
            fs.unlinkSync(f.path);
            return {
              name: f.originalname,
              uri: r.secure_url,
              mimeType: f.mimetype,
              size: f.size,
            };
          })
      )
    );

    const {
      classId,
      subjectId,
      unit,
      type,
      text,
      note,
      dueDate,
      assignedTo,
      assignedBy,
      quizQuestions,
    } = req.body;

    if (
      !classId ||
      !subjectId ||
      !unit ||
      !type ||
      !dueDate ||
      !assignedTo?.length ||
      !assignedBy
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const assignedToObjectIds = assignedTo.map(
      (id) => {
        
        console.log(id)
        new mongoose.Types.ObjectId(id)
      }
    );

    console.log(quizQuestions);

      const parsedQuizQuestions = type === "file" ? 
       JSON.parse(quizQuestions)
      : quizQuestions;

    const newTest = await AssignTest.create({
      classId: new mongoose.Types.ObjectId(classId),
      subjectId: new mongoose.Types.ObjectId(subjectId),
      unit,
      type,
      text,
      files: uploaded,
      note,
      dueDate: new Date(dueDate),
      assignedTo: assignedToObjectIds,
      assignedBy: new mongoose.Types.ObjectId(assignedBy),
      quizQuestions:parsedQuizQuestions,
    });
console.log({parsedQuizQuestions},parsedQuizQuestions[0])
    console.log(newTest.files);
    res.status(201).json(newTest);
  } catch (err) {
    console.error("Upload/Create error:", err);
    res.status(500).json({ message: err.message });
  } finally {
  // Clean uploads folder
  const uploadsDir = path.join(__dirname, "../uploads");
  try {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      fs.unlinkSync(path.join(uploadsDir, file));
    }
    console.log("✅ Uploads folder cleaned");
  } catch (err) {
    console.error("❌ Failed to clean uploads folder:", err.message);
  }
}
};

// GET all tests (with optional filters: classId, subjectId, teacherId)
exports.getAllTests = asyncHandler(async (req, res) => {
  const { classId, subjectId, teacherId } = req.query;
  const filter = {};
  console.log({ classId, subjectId, teacherId });

  if (classId) filter.classId = new mongoose.Types.ObjectId(classId);
  if (subjectId) filter.subjectId = new mongoose.Types.ObjectId(subjectId);
  if (teacherId && teacherId != "undefined")
    filter.assignedBy = new mongoose.Types.ObjectId(teacherId); // ✅ FIX HERE

  const tests = await AssignTest.find(filter) // <-- use filter here
    .populate("classId subjectId assignedBy assignedTo")
    .sort({ dueDate: -1, createdAt: -1 });

  // console.log({ a: tests[0].assignedTo });
  res.json(tests);
});

// GET tests assigned to a particular student (via studentStatus & assignedTo)
exports.getTestsByStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid student ID" });

  const tests = await AssignTest.find({ assignedTo: id })
    .populate("classId subjectId assignedBy studentStatus.studentId")
    .lean();

  tests.forEach((test) => {
    test.studentStatus = test.studentStatus.find(
      (st) => st.studentId?.toString() === id.toString()
    );
  });

  res.json(tests);
});

// GET single test by _id
exports.getTestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid test ID" });

  const test = await AssignTest.findById(id).populate(
    "classId subjectId assignedBy studentStatus.studentId"
  );
  if (!test) return res.status(404).json({ message: "Test not found" });

  res.json(test);
});

// UPDATE test by _id
exports.updateTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);
  if (updates.assignedTo)
    updates.assignedTo = updates.assignedTo.map(
      (a) => new mongoose.Types.ObjectId(a) // ✅ CORRECT
    );

  const result = await AssignTest.findByIdAndUpdate(id, updates, {
    new: true,
  }).populate("classId subjectId assignedBy studentStatus.studentId");

  if (!result) return res.status(404).json({ message: "Test not found" });

  res.json(result);
});

// DELETE test by _id
// exports.deleteTest = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const result = await AssignTest.findByIdAndDelete(id);
//   if (!result) return res.status(404).json({ message: "Test not found" });
//   res.json({ message: "Test deleted successfully" });
// });

const getResourceType = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  return "raw"; // For PDFs, docs, etc.
};

exports.deleteTest = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const test = await AssignTest.findById(id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Delete Cloudinary files if test is of type 'file'
    if (test.type === "file" && Array.isArray(test.files) && test.files.length > 0) {
      try {
        const deletePromises = test.files.map((file) => {
          const segments = file.uri.split("/");
          console.log(file);
          const publicIdWithExtension = segments.slice(-2).join("/").split(".")[0]; // assignTests/filename
          const resourceType = getResourceType(file.mimeType); // get correct type from mime

          return cloudinary.uploader.destroy(publicIdWithExtension, {
            resource_type: resourceType,
          });
        });

        await Promise.all(deletePromises);
      } catch (cloudErr) {
        console.error("❌ Cloudinary deletion error:", cloudErr);
        // Optional: Continue deletion even if file deletion fails
      }
    }

    await test.deleteOne();

    res.status(200).json({ message: "Test and associated files deleted successfully." });
  } catch (err) {
    console.error("❌ Delete test error:", err);
    res.status(500).json({ message: "Something went wrong while deleting the test.", error: err.message });
  }
});


// UPDATE a student's submission or status within a test
exports.updateStudentStatus = asyncHandler(async (req, res) => {
  const { testId, studentId } = req.params;
  const { status, submittedAt, submission, marksObtained, feedback } = req.body;

  const test = await AssignTest.findById(testId);
  if (!test) return res.status(404).json({ message: "Test not found" });

  const stu = test.studentStatus.find(
    (s) => s.studentId.toString() === studentId
  );
  if (!stu)
    return res
      .status(404)
      .json({ message: "Student not assigned to this test" });

  if (status) stu.status = status;
  if (submittedAt) stu.submittedAt = new Date(submittedAt);
  if (submission) stu.submission = submission;
  if (marksObtained != null) stu.marksObtained = marksObtained;
  if (feedback != null) stu.feedback = feedback;

  await test.save();
  res.json(stu);
});
