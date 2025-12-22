require("dotenv").config();
const connectDB = require("../db/db");
const sendExpiryEmails = require("./expiryEmailJob");

(async () => {
  try {
    await connectDB();
    console.log("DB connected for Expiry Email Job");

    await sendExpiryEmails();

    console.log("Expiry Email Job finished successfully");
    process.exit(0);
  } catch (error) {
    console.error("Expiry Email Job failed:", error);
    process.exit(1);
  }
})();
