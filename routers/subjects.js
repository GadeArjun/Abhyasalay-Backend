const express = require("express");
const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getSubjectsByClassId,
} = require("../controllers/subjects");
const { authMiddleware } = require("../middlewares/auth");
const router = express.Router();

// You can wrap these with authMiddleware if needed
router.post("/", createSubject);
router.get("/",  getAllSubjects);
router.get("/:id",  getSubjectById);
router.get("/class/:classId",  getSubjectsByClassId);
router.put("/:id",  updateSubject);
router.delete("/:id",  deleteSubject);

exports.subjectRouters = router;
