const express = require("express");
const {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
} = require("../controllers/class");
const router = express.Router();

router.post("/", createClass);
router.get("/", getAllClasses);
router.get("/:id", getClassById);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

exports.classRouters = router;

