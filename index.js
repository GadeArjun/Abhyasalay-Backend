require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./utils/db");
require("./config/cloudinary");

// Routes
const { teacherRouters } = require("./routers/teacher");
const { studentRouters } = require("./routers/student");
const { authMiddleware } = require("./middlewares/auth");
const { authRouters } = require("./routers/auth");
const { classRouters } = require("./routers/class");
const { subjectRouters } = require("./routers/subjects");
const { assignTestRouters } = require("./routers/assignTest");

// Init App
const app = express();
const PORT = process.env.PORT || 8080;

// Connect DB
connectDB();

// Middlewares
app.use(
  cors({
    origin: "*",
    credentials: true, // Allow sending cookies
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!", success: true });
});

// Routes
app.use("/api/teachers", teacherRouters);
app.use("/api/students", studentRouters);
app.use("/api/auth", authRouters);
app.use("/api/classes", authMiddleware, classRouters);
app.use("/api/subjects", authMiddleware, subjectRouters);
app.use("/api/assign-tests", authMiddleware, assignTestRouters);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || "Internal Server Error" });
});
// Server Listen
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
