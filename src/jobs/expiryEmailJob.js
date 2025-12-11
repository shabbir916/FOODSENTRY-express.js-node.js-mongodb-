const pantryModel = require("../models/pantry.model");
const userModel = require("../models/user.model");
const getExpiringSoonNotifications = require("../utils/expiryNotifications");
const sendEmail = require("../utils/sendEmail");

async function sendExpiryEmails() {
  const users = await userModel.find({});

  for (const user of users) {
    try {
      const notifications = await getExpiringSoonNotifications(user._id);
      if (!Array.isArray(notifications) || notifications.length === 0) continue;

      const html = `
        <h2>Your Pantry Items Are Expiring Soon</h2>
        <ul>
          ${notifications
            .map((i) => `<li><b>${i.name}</b> (${i.expiryType === "opened" ? "after opening" : "original expiry"}) — ${i.daysLeft === 0 ? "Expires Today" : `in ${i.daysLeft} day(s)`}</li>`)
            .join("")}
        </ul>
      `;

      await sendEmail({
        to: user.email,
        subject: "FOODSENTRY — Pantry items expiring soon",
        html,
        text: `You have ${notifications.length} pantry item(s) expiring soon.`,
      });

      for (const n of notifications) {
        if (n.expiryType === "opened") {
          await pantryModel.findByIdAndUpdate(n._id, { emailNotifiedOpenExpiry: true });
        } else {
          await pantryModel.findByIdAndUpdate(n._id, { emailNotified: true });
        }
      }
    } catch (err) {
      console.error("sendExpiryEmails error for user", user.email, err);
    }
  }
}

module.exports = sendExpiryEmails;
