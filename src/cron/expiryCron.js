const cron = require("node-cron");
const sendExpiryEmails = require("../jobs/expiryEmailJob");

cron.schedule("0 9 * * *", async () => {
  console.log("Running daily email job (expiry + opened item tracking)...");
  await sendExpiryEmails();
});
