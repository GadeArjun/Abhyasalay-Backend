require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cron = require("node-cron");
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
const { markLateSubmissions } = require("./utils/markLateSubmissions");
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

app.use((err, req, res, next) => {
  try {
    console.error(err.stack);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Internal Server Error" });
  } catch (err) {
    console.log({ err });
  }
});

// Routes
app.use("/api/teachers", teacherRouters);
app.use("/api/students", studentRouters);
app.use("/api/auth", authRouters);
app.use("/api/classes", authMiddleware, classRouters);
app.use("/api/subjects", authMiddleware, subjectRouters);
app.use("/api/assign-tests", authMiddleware, assignTestRouters);

// 🕐 Schedule: every day at 12:01 AM
cron.schedule("1 0 * * *", () => {
  markLateSubmissions();
});

// cron.schedule("*/30 * * * * *", () => {
//   markLateSubmissions();
// });

// Server Listen
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
