// controllers/assignTest.controller.js

const mongoose = require("mongoose");
const AssignTest = require("../models/AssignTest");
const Student = require("../models/Student");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const path = require("path");
// Handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.uploadFilesAndCreateTest = async (req, res) => {
  try {
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

    const parsedAssignTo =
      type === "file" ? JSON.parse(assignedTo) : assignedTo;

    const assignedToObjectIds = parsedAssignTo.map((id) => {
      return new mongoose.Types.ObjectId(id);
    });

    const assignedStudents = await Student.find({
      _id: { $in: assignedToObjectIds },
    }).select("_id fullName");

    const studentStatus = assignedStudents.map((s) => ({
      studentId: s._id,
      studentName: s.fullName,
      status: "pending",
      submittedAt: null,
      marksObtained: 0,
      submission: {
        textAnswer: "",
        fileUrl: [],
        quizAnswers: [],
      },
      feedback: "",
    }));

    const parsedQuizQuestions =
      type === "file" ? JSON.parse(quizQuestions) : quizQuestions;

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
      quizQuestions: parsedQuizQuestions,
      studentStatus,
    });

    // const newTest = await AssignTest.create({
    //   classId: new mongoose.Types.ObjectId(classId),
    //   subjectId: new mongoose.Types.ObjectId(subjectId),
    //   unit,
    //   type,
    //   text,
    //   files: uploaded,
    //   note,
    //   dueDate: new Date(dueDate),
    //   assignedTo: assignedToObjectIds,
    //   assignedBy: new mongoose.Types.ObjectId(assignedBy),
    //   quizQuestions: parsedQuizQuestions,
    // });

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

  if (classId) filter.classId = new mongoose.Types.ObjectId(classId);
  if (subjectId) filter.subjectId = new mongoose.Types.ObjectId(subjectId);
  if (teacherId && teacherId != "undefined")
    filter.assignedBy = new mongoose.Types.ObjectId(teacherId);

  const tests = await AssignTest.find(filter) // <-- use filter here
    .populate("classId subjectId assignedBy assignedTo")
    .sort({ dueDate: -1, createdAt: -1 });

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

  test.quizQuestions.map((q) => {
    // correctAnswer
  });
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
    if (
      test.type === "file" &&
      Array.isArray(test.files) &&
      test.files.length > 0
    ) {
      try {
        const deletePromises = test.files.map((file) => {
          const segments = file.uri.split("/");
          const publicIdWithExtension = segments
            .slice(-2)
            .join("/")
            .split(".")[0]; // assignTests/filename
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

    res
      .status(200)
      .json({ message: "Test and associated files deleted successfully." });
  } catch (err) {
    console.error("❌ Delete test error:", err);
    res.status(500).json({
      message: "Something went wrong while deleting the test.",
      error: err.message,
    });
  }
});

// UPDATE a student's submission or status within a test
exports.updateStudentStatus = asyncHandler(async (req, res) => {
  const { testId, studentId } = req.params;
  const { status, submittedAt, submission, marksObtained, feedback } = req.body;

  const test = await AssignTest.findById(testId);
  if (!test) return res.status(404).json({ message: "Test not found" });

  // Check if student is assigned
  const isAssigned = test.assignedTo.find((s) => s.toString() === studentId);
  if (!isAssigned) {
    return res
      .status(404)
      .json({ message: "Student not assigned to this test" });
  }

  // Find the student status record
  let stuStatus = test.studentStatus.find(
    (s) => s.studentId.toString() === studentId
  );

  // 🔁 Upload files if test type is "file" or "text"
  let fileUrls = [];
  if ((test.type === "file" || test.type === "text") && req.files?.length > 0) {
    for (const file of req.files) {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "student_submissions",
        resource_type: "auto",
      });

      fileUrls.push({
        name: file.originalname,
        url: uploadResult.secure_url,
        mimeType: file.mimetype,
        size: file.size,
      });

      // Clean up local file
      fs.unlinkSync(file.path);
    }
  }

  // Calculate marks if it's a quiz
  let calculatedMarks = 0;
  if (test.type === "quiz" && submission?.quizAnswers) {
    const quizAnswers = submission.quizAnswers;
    const correctAnswers = test.quizQuestions.map((q) => q.correctAnswer);

    for (
      let i = 0;
      i < Math.min(quizAnswers.length, correctAnswers.length);
      i++
    ) {
      if (quizAnswers[i] === correctAnswers[i]) {
        calculatedMarks++;
      }
    }
  }

  if (!stuStatus) {
    // If not found, push a new one
    const student = await mongoose.model("Student").findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    stuStatus = {
      studentId: student._id,
      studentName: student.fullName,
      status: status || "pending",
      submittedAt: submittedAt ? new Date(submittedAt) : null,
      marksObtained:
        test.type === "quiz" ? calculatedMarks : marksObtained ?? 0,
      submission: {
        ...(submission || {}),
        fileUrl: fileUrls.length > 0 ? fileUrls : undefined,
        textAnswer: submission?.textAnswer || "",
      },
      feedback: feedback || "",
    };

    test.studentStatus.push(stuStatus);
  } else {
    // Update existing fields
    if (status) stuStatus.status = status;
    if (submittedAt) stuStatus.submittedAt = new Date(submittedAt);
    if (submission) {
      stuStatus.submission = {
        ...stuStatus.submission,
        ...submission,
        fileUrl: fileUrls.length > 0 ? fileUrls : stuStatus.submission.fileUrl,
      };
    } else if (fileUrls.length > 0) {
      stuStatus.submission = {
        ...stuStatus.submission,
        fileUrl: fileUrls,
      };
    }
    if (test.type === "quiz") {
      stuStatus.marksObtained = calculatedMarks;
    } else if (marksObtained != null) {
      stuStatus.marksObtained = marksObtained;
    }
    if (feedback != null) stuStatus.feedback = feedback;
  }

  // Save the updated test

  await test.save();
  res.json({ message: "Student status updated", data: stuStatus });
});

exports.markTestAsSeen = asyncHandler(async (req, res) => {
  try {
    const { testId, studentId } = req.body;

    if (!testId || !studentId) {
      return res
        .status(400)
        .json({ message: "Test ID and Student ID are required." });
    }

    const assignTest = await AssignTest.findById(testId);
    if (!assignTest) {
      return res.status(404).json({ message: "Assigned test not found." });
    }

    // Find the student in the studentStatus array
    const studentStatus = assignTest.studentStatus.find(
      (entry) => entry.studentId.toString() === studentId
    );

    if (!studentStatus) {
      return res
        .status(404)
        .json({ message: "Student not found in this test." });
    }

    if (studentStatus.status === "pending") {
      studentStatus.status = "seen";
      await assignTest.save();
      return res.status(200).json({ message: "Status updated to seen." });
    } else {
      return res.status(200).json({
        message: `No update. Current status: ${studentStatus.status}`,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating status." });
  }
});

exports.updateStudentMarks = async (req, res) => {
  try {
    const { testId, studentId, marksObtained } = req.body;

    if (!testId || !studentId || marksObtained == null) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const test = await AssignTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found." });
    }

    const studentStatus = test.studentStatus.find(
      (s) => s.studentId.toString() === studentId
    );

    if (!studentStatus) {
      return res.status(404).json({ message: "Student submission not found." });
    }

    studentStatus.marksObtained = marksObtained;
    await test.save();

    return res
      .status(200)
      .json({ message: "Marks updated successfully.", studentStatus });
  } catch (error) {
    console.error("Error updating marks:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
