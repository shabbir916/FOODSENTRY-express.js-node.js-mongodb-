const mongoose = require("mongoose");
const userModel = require("../models/user.model");
const pantryModel = require("../models/pantry.model");
const { expiryAlert } = require("../emails");
const sendEmail = require("../utils/sendEmail");
const getExpiringSoonNotifications = require("../utils/expiryNotifications");

async function sendExpiryEmails() {
  try {
    console.log("Expiry Email Job started");

    const users = await userModel.find({});

    for (const user of users) {
      if (!user.emailPreferences?.expiryAlerts) continue;

      const notifications = await getExpiringSoonNotifications(user._id);
      if (!notifications.length) continue;

      const html = expiryAlert(notifications);

      await sendEmail({
        to: user.email,
        subject: "FOODSENTRY — Pantry Expiry Alert",
        html,
      });

      console.log(`Expiry email sent to ${user.email}`);

      const originalExpiryIds = notifications
        .filter((n) => n.expirySource === "original")
        .map((n) => n._id);

      const openedExpiryIds = notifications
        .filter((n) => n.expirySource === "opened")
        .map((n) => n._id);

      if (originalExpiryIds.length) {
        await pantryModel.updateMany(
          { _id: { $in: originalExpiryIds } },
          { $set: { emailNotified: true } }
        );
      }

      if (openedExpiryIds.length) {
        await pantryModel.updateMany(
          { _id: { $in: openedExpiryIds } },
          { $set: { emailNotifiedOpenExpiry: true } }
        );
      }
    }

    console.log("Expiry Email Job completed");
  } catch (error) {
    console.error("Expiry Email Job failed:", error);
  }
}

module.exports = sendExpiryEmails;
