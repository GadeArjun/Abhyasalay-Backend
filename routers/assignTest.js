const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const ctrl = require("../controllers/assignTest");

// More specific routes first
router.get("/student/:id", ctrl.getTestsByStudent);
router.post("/", upload.array("files", 5), ctrl.uploadFilesAndCreateTest);
router.get("/", ctrl.getAllTests);
router.patch("/:id", ctrl.updateTest);
router.delete("/:id", ctrl.deleteTest);

// Must come after /student/:id
router.get("/:id", ctrl.getTestById);

router.post(
  "/:testId/student/:studentId",
  upload.array("files", 5),
  ctrl.updateStudentStatus
);

router.post("/mark-as-seen", ctrl.markTestAsSeen);

router.post("/update-student-marks", ctrl.updateStudentMarks);

exports.assignTestRouters = router;
