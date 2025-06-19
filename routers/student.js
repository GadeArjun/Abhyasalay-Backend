// const express = require("express");
// const {
//   createStudent,
//   getAllStudents,
//   getStudentById,
//   updateStudent,
//   deleteStudent,
// } = require("../controllers/student");
// const { authMiddleware } = require("../middlewares/auth");

// const router = express.Router();

// router.post("/", createStudent);
// router.get("/",authMiddleware, getAllStudents);
// router.get("/:id",authMiddleware, getStudentById);
// router.put("/:id",authMiddleware, updateStudent);
// router.delete("/:id",authMiddleware, deleteStudent);

// exports.studentRouters = router;

const express = require('express');
const router = express.Router();
const {
 createStudent,
 getStudents,
 getStudentById,
 updateStudentById,
 deleteStudentById
} = require("../controllers/student");

router.post('/', createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudentById);
router.delete('/:id', deleteStudentById);

exports.studentRouters = router;
