// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create `uploads/` folder if not existing
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Define storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, name);
  },
});


const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // ≤10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    return allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Unsupported file type"));
  },
});

module.exports = upload;
