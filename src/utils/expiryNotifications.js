const pantryModel = require("../models/pantry.model");
const { expiryDateRange } = require("./expiryHelper");
const { getExpiryStatus } = require("../utils/expiryHelper");

async function getExpiringSoonNotifications(userId) {
  const items = await pantryModel.find({ user: userId });

  const { today } = await expiryDateRange();

  const notifications = [];

  for (const item of items) {
    if (!item.expiryDate) continue;

    const { diffDays, status } = await getExpiryStatus(item.expiryDate);

    if (diffDays < 0) return;
    
    if (diffDays === 0 || diffDays <= 6) {
      notifications.push({
        _id: item._id,
        name: item.itemName,
        expiryDate: item.expiryDate,
        daysLeft: diffDays,
        status,
      });
    }
  }

  return notifications;
}

module.exports = getExpiringSoonNotifications;
