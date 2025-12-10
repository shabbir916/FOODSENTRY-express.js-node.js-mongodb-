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
      <h2>Your Pantry Alerts</h2>
      <p>The following items need your attention:</p>
      <ul>
        ${notifications.map((i) => {
          if (i.type === "opened") {
            return `
              <li>
                <b>${i.name}</b> was opened <b>${i.daysLeft} days ago</b> and must be used within <b>${i.useWithinDays} days</b>.
              </li>
            `;
          } else {
            return `
              <li>
                <b>${i.name}</b> will expire in <b>${i.daysLeft} days</b>.
              </li>
            `;
          }
        }).join("")}
      </ul>
    `;

    await sendEmail({
      to: user.email,
      subject: "Your Pantry Items Need Attention",
      html
    });

    // Mark items as notified
    for (let item of notifications) {
      await pantryModel.findByIdAndUpdate(item._id, {
        emailNotified: true,
      });
    }
  }
}

module.exports = sendExpiryEmails;
