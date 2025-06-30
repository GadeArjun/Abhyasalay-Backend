require("dotenv").config();
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cron = require("node-cron");
const connectDB = require("./utils/db");
require("./config/cloudinary");
const path = require("path");
// Routes
const { teacherRouters } = require("./routers/teacher");
const { studentRouters } = require("./routers/student");
const { authMiddleware } = require("./middlewares/auth");
const { authRouters } = require("./routers/auth");
const { classRouters } = require("./routers/class");
const { subjectRouters } = require("./routers/subjects");
const { assignTestRouters } = require("./routers/assignTest");
const { markLateSubmissions } = require("./utils/markLateSubmissions");
const deviceTokenRoutes = require("./routers/deviceTokenRoutes");
const { notificationsRouter } = require("./routers/notificationRoutes");
const { startQueueWorker } = require("./utils/queueProcessor");

// Init App
const app = express();
const PORT = process.env.PORT || 8080;

app.use("/public", express.static(path.join(__dirname, "public")));

// Connect DB
connectDB().then(() => {
  // startQueueWorker();
});

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
app.use("/api/device-token", deviceTokenRoutes);
app.use("/api/notifications", authMiddleware, notificationsRouter);

// 🕐 Schedule: every day at 12:01 AM
cron.schedule("1 0 * * *", () => {
  markLateSubmissions();
});
1;

// cron.schedule("*/30 * * * * *", () => {
//   markLateSubmissions();
// });

// Server Listen

// HTTP + WebSocket server

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// const { GoogleGenAI } = require("@google/genai");

// // ✅ Initialize Gemini client
// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// async function main() {
//   // const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

//   const result = await ai.models.generateContent({
//     model: "gemini-1.5-flash",
//     contents: "Explain how AI works in a few words",
//   });

//   console.log("📥 Gemini response:", result);
// }

// main().catch((err) => console.error("❌ Error:", err));

// require("dotenv").config();
// const axios = require("axios");
// const sharp = require("sharp");
// const pdfParse = require("pdf-parse");
// const Tesseract = require("tesseract.js");
// const { GoogleGenAI } = require("@google/genai");

// const genAI = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// // Enhance image
// async function preprocessImage(buffer) {
//   return sharp(buffer).grayscale().normalize().sharpen().toBuffer();
// }

// // OCR fallback (optional, for manual check)
// async function extractTextFromImage(url) {
//   const { data } = await axios.get(url, { responseType: "arraybuffer" });
//   const enhanced = await preprocessImage(Buffer.from(data));
//   const result = await Tesseract.recognize(enhanced, "eng+mar");
//   return result.data.text.trim();
// }

// // PDF Text Extractor (not Gemini, just for comparison)
// async function extractTextFromPDF(url) {
//   const { data } = await axios.get(url, { responseType: "arraybuffer" });
//   const pdfBuffer = Buffer.from(data);
//   const parsed = await pdfParse(pdfBuffer);
//   return parsed.text.trim();
// }

// // Gemini Vision Handler

// async function analyzeWithGeminiVision(buffer, mimeType) {
//   const base64Data = buffer.toString("base64");

//   const result = await genAI.models.generateContent({
//     model: "gemini-1.5-flash",
//     contents: [
//       {
//         role: "user",
//         parts: [
//           {
//             text:
//               "🛠️ कृपया या फाईलमधून मजकूर अचूकपणे वाचा आणि योग्य अशुद्धलेखन व विरामचिन्हांसह सुधारित करा.\n" +
//               "❌ कृपया कोणतेही भाषांतर, वर्णन किंवा संक्षेप करू नका.\n" +
//               "✅ फक्त सुधारीत मजकूर परत द्या (as-is corrected output in the original language).",
//           },
//           {
//             inlineData: {
//               mimeType,
//               data: base64Data,
//             },
//           },
//         ],
//       },
//     ],
//   });

//   return (
//     result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
//     "[Gemini corrected output missing]"
//   );
// }

// // File Processor
// async function processFiles({ imageUrls = [], pdfUrls = [] }) {
//   for (const url of imageUrls) {
//     try {
//       console.log(`\n📷 Image URL: ${url}`);
//       const { data } = await axios.get(url, { responseType: "arraybuffer" });
//       const buffer = Buffer.from(data);

//       const geminiText = await analyzeWithGeminiVision(buffer, "image/jpeg");
//       console.log("👁️ Gemini (Image Text):\n", geminiText);
//     } catch (err) {
//       console.error(`❌ Image failed ${url}:\n`, err.message);
//     }
//   }

//   for (const url of pdfUrls) {
//     try {
//       console.log(`\n📄 PDF URL: ${url}`);
//       const { data } = await axios.get(url, { responseType: "arraybuffer" });
//       const buffer = Buffer.from(data);

//       const geminiText = await analyzeWithGeminiVision(
//         buffer,
//         "application/pdf"
//       );
//       console.log("👁️ Gemini (PDF Text):\n", geminiText);
//     } catch (err) {
//       console.error(`❌ PDF failed ${url}:\n`, err.message);
//     }
//   }
// }

// // 🔥 Run the test
// processFiles({
//   imageUrls: [
//     "https://res.cloudinary.com/dfemyagrn/image/upload/v1751187329/student_submissions/uzphlnnrs69zuwzv4dax.jpg",
//     // Add more image URLs
//   ],
//   pdfUrls: [
//     "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
//     // Add more PDF URLs
//   ],
// });
