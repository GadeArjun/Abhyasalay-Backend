const { GoogleGenAI } = require("@google/genai");
const AnalysisLog = require("../models/AnalysisLog");
const Tesseract = require("tesseract.js");
const axios = require("axios");
const sharp = require("sharp");
const pdfParse = require("pdf-parse");

const genAI_1 = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_1,
});

const genAI_2 = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_1,
});

// 📸 Enhance image for Gemini and OCR
async function preprocessImage(buffer) {
  return sharp(buffer).grayscale().normalize().sharpen().toBuffer();
}

// 🔤 Gemini Vision Handler
async function analyzeWithGeminiVision(buffer, mimeType) {
  const base64Data = buffer.toString("base64");

  const result = await genAI_1.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "🛠️ कृपया या फाईलमधून मजकूर अचूकपणे वाचा आणि योग्य अशुद्धलेखन व विरामचिन्हांसह सुधारित करा.\n" +
              "❌ कृपया कोणतेही भाषांतर, वर्णन किंवा संक्षेप करू नका.\n" +
              "✅ फक्त सुधारीत मजकूर परत द्या (as-is corrected output in the original language).",
          },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
  });

  return (
    result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    "[Gemini corrected output missing]"
  );
}

// 🧠 Extract and correct student answer from text/images/pdfs
async function extractStudentAnswerText(submission) {
  let finalAnswer = "";

  // 1. Direct text answer
  if (submission?.textAnswer?.trim()) {
    finalAnswer += submission.textAnswer.trim();
  }

  console.log({ a: submission.fileUrl });
  // 2. Uploaded files (image/pdf)
  if (submission?.fileUrl) {
    for (const file of submission.fileUrl) {
      const { url, mimeType } = file;
      try {
        const { data } = await axios.get(url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(data);

        const geminiText = await analyzeWithGeminiVision(buffer, mimeType);
        console.log({ geminiText });
        finalAnswer += `\n\n[Gemini (${mimeType})]:\n${geminiText}`;
      } catch (err) {
        console.warn(`❌ File processing failed (${mimeType}):`, err.message);
      }
    }
  }

  return finalAnswer.trim() || "[उत्तर सापडले नाही]";
}

// 🧠 Extract and correct teacher question from text/images/pdfs
async function extractTeacherQuestionText(test) {
  let finalQuestion = "";

  // 1. Direct text
  if (test.text?.trim()) {
    finalQuestion += test.text.trim();
  }

  // 2. File-based questions
  if (test.files?.length > 0) {
    for (const file of test.files) {
      const { uri, mimeType } = file;
      try {
        const { data } = await axios.get(uri, { responseType: "arraybuffer" });
        const buffer = Buffer.from(data);

        const geminiText = await analyzeWithGeminiVision(buffer, mimeType);
        finalQuestion += `\n\n[Gemini (${mimeType})]:\n${geminiText}`;
      } catch (err) {
        console.warn(`❌ Question file failed (${mimeType}):`, err.message);
      }
    }
  }

  return finalQuestion.trim() || "[प्रश्न सापडला नाही]";
}

// answer analyzer
const analyzeAnswer = async (question, answer, testId, studentId) => {
  try {
    console.log("🚀 Starting the analysis");

    const existingLog = await AnalysisLog.findOne({ testId, studentId });
    const now = new Date();
    if (existingLog && now - existingLog.lastAnalyzedAt < 90 * 1000) {
      throw new Error("⏳ Too early to analyze again. Please wait.");
    }

    const result = await genAI_2.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
खाली विद्यार्थ्याच्या उत्तराचे मूल्यांकन करा:

🔹 शिक्षकाचा मूळ प्रश्न:
${question}

🔹 विद्यार्थ्याचे उत्तर (स्वतः लिहिलेले):
${answer}

📌 कृपया लक्षात घ्या:
- विद्यार्थ्याने उत्तर नक्की स्वतः लिहिले आहे का, ते तपासा.
- जर उत्तर मूळ प्रश्नाच्या नमुन्याशी पूर्णपणे जुळत असेल (कॉपी-पेस्ट वाटत असेल), तर कमी गुण द्या.

- सर्व प्रश्नांची उत्तरे दिली आहेत का?
- काही प्रश्न वगळले गेले आहेत का?
- उत्तरांचा आशय, सर्जनशीलता आणि स्पष्टता कशी आहे?

❗ जर काही प्रश्नांची उत्तरेच दिली नसतील, तर गुण कमी करा.
- उत्तराच्या अचूकतेवर, सर्जनशीलता आणि स्पष्टीकरणावर आधारित गुण द्या.

⛔ इतर कोणताही मजकूर न लिहिता खालील JSON स्वरूपात उत्तर द्या:

{
  "marksPercent": <गुण टक्केवारीमध्ये>,
  "feedback": "<मराठीत फीडबॅक>"
}
`,
            },
          ],
        },
      ],
    });

    const rawText = result.text.trim();

    // Parse JSON safely
    let parsed;
    try {
      const cleanText = rawText
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
      parsed = JSON.parse(cleanText);
      // console.log({parsed})
    } catch (err) {
      console.warn("⚠️ Gemini did not return pure JSON. Trying fallback...");
      const match = rawText.match(/{[^}]+}/s);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    const marksPercent = parsed?.marksPercent ?? 0;
    const feedback = parsed?.feedback ?? "फीडबॅक सापडला नाही.";
    // console.log({ marksPercent, feedback });

    await AnalysisLog.findOneAndUpdate(
      { testId, studentId },
      { lastAnalyzedAt: now },
      { upsert: true }
    );

    return { marksPercent, feedback };
  } catch (err) {
    console.error("❌ Error analyzing answer:", err.message || err);
    throw err;
  }
};

module.exports = {
  analyzeAnswer,
  extractStudentAnswerText,
  extractTeacherQuestionText,
};
