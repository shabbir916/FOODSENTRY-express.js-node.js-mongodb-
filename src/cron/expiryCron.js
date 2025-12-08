const cron = require("node-cron");
const sendExpiryEmails = require("../jobs/expiryEmailJob");

cron.schedule("0 9 * * *", async () => {
  console.log("📧 Running daily expiry email job...");
  await sendExpiryEmails();
});
