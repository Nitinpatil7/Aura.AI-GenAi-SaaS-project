const cron = require("node-cron");
const Lead = require("../model/lead");

async function markDueFollowups() {
  const now = new Date();
  const result = await Lead.updateMany(
    {
      status: "sent",
      nextFollowUpAt: { $lte: now },
    },
    { $set: { status: "follow_up_needed" } },
  );

  if (result.modifiedCount) {
    console.log(`Lead follow-up scheduler marked ${result.modifiedCount} lead(s) as follow_up_needed.`);
  }

  return result;
}

function startLeadFollowupCron() {
  cron.schedule(
    process.env.LEAD_FOLLOWUP_CRON || "0 9 * * *",
    () => {
      markDueFollowups().catch((error) => {
        console.error("Lead follow-up scheduler failed:", error.message);
      });
    },
    { timezone: process.env.LEAD_FOLLOWUP_TIMEZONE || "Asia/Kolkata" },
  );
}

module.exports = { markDueFollowups, startLeadFollowupCron };
