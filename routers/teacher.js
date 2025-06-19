const express = require("express");
const {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacher");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.post("/", createTeacher);
router.get("/", authMiddleware, getAllTeachers);
router.get("/:id", authMiddleware, getTeacherById);
router.put("/:id", authMiddleware, updateTeacher);
router.delete("/:id", authMiddleware, deleteTeacher);

exports.teacherRouters = router;
