// routes/assignTests.route.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const ctrl = require("../controllers/assignTest");

router.post("/", upload.array("files", 5), ctrl.uploadFilesAndCreateTest);
router.get("/", ctrl.getAllTests);
router.get("/:id", ctrl.getTestById);
router.get("/student/:id", ctrl.getTestsByStudent);
router.patch("/:id", ctrl.updateTest);
router.delete("/:id", ctrl.deleteTest);
router.patch("/:testId/student/:studentId", ctrl.updateStudentStatus);

exports.assignTestRouters = router;
