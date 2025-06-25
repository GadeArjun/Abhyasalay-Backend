const AssignTest = require("../models/AssignTest");

exports.markLateSubmissions = async () => {
  try {
    const now = new Date();
    console.log(`⏰ Running late check at ${now.toISOString()}`);

    const tests = await AssignTest.find({ isActive: true });

    for (const test of tests) {
      const due = new Date(test.dueDate);

      const lateThreshold = new Date(
        due.getFullYear(),
        due.getMonth(),
        due.getDate() + 1,
      
      );

      // Skip if current time is before the late threshold
      if (now < lateThreshold) continue;

      let updated = false;

      test.studentStatus = test.studentStatus.map((entry) => {
        const isNotMarked =
          entry.status === "pending" || entry.status === "seen";
        const notSubmitted = !entry.submittedAt;

        // Only mark pending or seen students (who haven't submitted) as late
        if (isNotMarked && notSubmitted) {
          entry.status = "late";
          updated = true;
        }

        return entry;
      });

      if (updated) {
        await test.save();
        console.log(`✅ Updated test ${test._id} - Marked late students`);
      }
    }

    console.log("🎯 Late submission update completed.");
  } catch (error) {
    console.error("❌ Error marking late submissions:", error);
  }
};

