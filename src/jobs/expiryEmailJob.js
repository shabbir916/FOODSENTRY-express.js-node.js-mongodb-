const mongoose = require("mongoose");
const userModel = require("../models/user.model");
const { expiryAlert } = require("../emails/index");
const sendEmail = require("../utils/sendEmail");
const getExpiringSoonNotifications = require("../utils/expiryNotifications");

async function sendExpiryEmails() {
  try {
    console.log("Expiry Email Job started");

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected");
    }

    const users = await userModel.find({});

    for (const user of users) {
      if (!user.emailPreferences?.expiryAlerts) {
        continue;
      }
      
      const notifications = await getExpiringSoonNotifications(user._id);

      if (!notifications || notifications.length === 0) continue;

      const html = expiryAlert(notifications);

      await sendEmail({
        to: user.email,
        subject: "FOODSENTRY — Pantry Expiry Alert",
        html,
      });

      console.log(`Email sent to ${user.email}`);
    }

    console.log("Expiry Email Job completed");
  } catch (error) {
    console.error("Expiry Email Job failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

module.exports = sendExpiryEmails;
