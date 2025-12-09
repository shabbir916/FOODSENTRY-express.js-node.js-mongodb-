const pantryModel = require("../models/pantry.model");
const userModel = require("../models/user.model");
const getExpiringSoonNotifications = require("../utils/expiryNotifications");
const sendEmail = require("../utils/sendEmail");

async function sendExpiryEmails() {
  const users = await userModel.find({});

  for (let user of users) {
    const notifications = await getExpiringSoonNotifications(user._id);

    if (!Array.isArray(notifications) || notifications.length === 0) continue;

    const html = `
      <h2>Your Items are Expiring Soon</h2>
      <ul>
        ${notifications
          .map(
            (i) => `
              <li>
                <b>${i.name}</b> will expire in <b>${i.daysLeft} days</b>
              </li>
            `
          )
          .join("")}
      </ul>
    `;

    await sendEmail(
      process.env.EMAIL_USER,
      "Your Pantry Items Are Expiring Soon",
      html
    );

    // Mark notified
    for (let item of notifications) {
      await pantryModel.findByIdAndUpdate(item._id, { emailNotified: true });
    }
  }
}

module.exports = sendExpiryEmails;
