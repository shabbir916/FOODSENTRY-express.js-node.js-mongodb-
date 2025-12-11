const pantryModel = require("../models/pantry.model");
const { attachExpiryComputedFields } = require("./expiryHelper");

async function getExpiringSoonNotifications(userId) {
  const items = await pantryModel.find({ user: userId });

  const enriched = await Promise.all(items.map((it) => attachExpiryComputedFields(it)));

  const notifications = [];

  for (const item of enriched) {
    if (item.expiryStatus === "Expiring Today" || item.expiryStatus === "Expiring Soon") {
      const expiryType = item.openedExpiryDate && item.finalExpiryDate && (new Date(item.openedExpiryDate).getTime() === new Date(item.finalExpiryDate).getTime())
        ? "opened"
        : "original";

      notifications.push({
        _id: item._id,
        name: item.name,
        expiryDate: item.expiryDate || null,
        finalExpiryDate: item.finalExpiryDate || null,
        expiryType,
        daysLeft: item.daysLeft,
      });
    }
  }

  notifications.sort((a, b) => a.daysLeft - b.daysLeft);

  return notifications;
}

module.exports = getExpiringSoonNotifications;
