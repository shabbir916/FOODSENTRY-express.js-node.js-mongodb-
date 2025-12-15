const pantryModel = require("../models/pantry.model");
const { attachExpiryComputedFields } = require("./expiryHelper");

async function getExpiringSoonNotifications(userId) {
  const items = await pantryModel.find({ user: userId });

  const enriched = await Promise.all(
    items.map((it) => attachExpiryComputedFields(it))
  );

  const notifications = [];

  for (const item of enriched) {
    if (item.expiryStatus === "Expired") continue;

    if (
      item.expiryStatus !== "Expiring Today" &&
      item.expiryStatus !== "Expiring Soon"
    ) {
      continue;
    }

    if (item.expirySource === "opened" && item.emailNotifiedOpenExpiry)
      continue;

    if (item.expirySource === "original" && item.emailNotified) continue;

    notifications.push({
      _id: item._id,
      name: item.name,
      finalExpiryDate: item.finalExpiryDate,
      expirySource: item.expirySource,
      daysLeft: item.daysLeft,
    });
  }

  notifications.sort((a, b) => a.daysLeft - b.daysLeft);

  return notifications;
}

module.exports = getExpiringSoonNotifications;
