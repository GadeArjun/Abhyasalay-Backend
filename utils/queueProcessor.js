const JobQueue = require("../models/JobQueue");
const AssignTest = require("../models/AssignTest");
const { analyzeAnswer } = require("./analyzeSubmission");

const MAX_RETRIES = 300000000;
const ANALYSIS_DELAY = 90 * 1000;

async function processJob(job) {
  try {
    job.status = "processing";
    await job.save();

    const { question, answer, testId, studentId } = job;

    const { marksPercent, feedback } = await analyzeAnswer(
      question,
      answer,
      testId,
      studentId
    );

    console.log({ marksPercent, feedback, testId, studentId });

    const test = await AssignTest.findById(testId);
    const stuStatus = test.studentStatus.find((s) => {
      return s.studentId.toString() === studentId.toString();
    });

    if (!stuStatus) throw new Error("Student not found in test");

    stuStatus.marksObtained = marksPercent;
    stuStatus.feedback = feedback;
    await test.save();

    job.status = "completed";
    job.error = null;
    await job.save();

    console.log(`✅ Job ${job._id} completed: ${studentId}`);
  } catch (err) {
    console.log({ err });
    job.retries++;
    job.error = err.message;

    if (job.retries >= MAX_RETRIES) {
      job.status = "failed";
      console.error(`❌ Job ${job._id} failed permanently:`, err.message);
    } else {
      job.status = "pending";
      job.scheduledAt = new Date(Date.now() + ANALYSIS_DELAY);
      console.warn(`⚠️ Retrying job ${job._id}, attempt ${job.retries}`);
    }

    await job.save();
  }
}

async function queueWorkerLoop() {
  // Step 1: Reset stuck jobs (older than 5 mins)
  await JobQueue.updateMany(
    {
      status: "processing",
      updatedAt: { $lte: new Date(Date.now() - 5 * 60 * 1000) },
    },
    { $set: { status: "pending" } }
  );

  // Step 2: Pick next pending job
  const job = await JobQueue.findOneAndUpdate(
    { status: "pending", scheduledAt: { $lte: new Date() } },
    { $set: { status: "processing" } },
    { sort: { scheduledAt: 1 }, new: true }
  );

  if (job) {
    console.log(`🔄 Processing job: ${job._id}`);
    await processJob(job);
  } else {
    // Optional: log only once in a while
    console.log("⏳ No pending jobs");
  }
}

function startQueueWorker(pollInterval = 30_000) {
  setInterval(queueWorkerLoop, pollInterval);
  console.log("🚀 Custom MongoDB queue worker started.");
}

module.exports = {
  enqueueJob: async ({ question, answer, testId, studentId }) => {
    await JobQueue.create({ question, answer, testId, studentId });
    console.log(`📨 Enqueued job for ${studentId}`);
  },
  startQueueWorker,
};
