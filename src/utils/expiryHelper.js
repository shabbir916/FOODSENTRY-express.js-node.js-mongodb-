const pantryModel = require("../models/pantry.model");

function expiryDateRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);
  next7Days.setHours(23, 59, 59, 999);

  return { today, next7Days };
}

async function getExpiryStatus(expiryDate) {
  const { today } = await expiryDateRange();

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Expiring Today";
  if (diffDays >= 1 && diffDays <= 6) return "Expiring Soon";
  return "Fresh";
}

function groupByExpiryStatus(items) {
  const groups = {
    expiringToday: [],
    expiringSoon: [],
    fresh: [],
    expired: [],
  };

  items.forEach((item) => {
    const status = getExpiryStatus(item.expiryDate);

    if (status === "Expiring Today") groups.expiringToday.push(item);
    else if (status === "Expiring Soon") groups.expiringSoon.push(item);
    else if (status === "Fresh") groups.fresh.push(item);
    else groups.expired.push(item);
  });

  return groups;
}

async function getExpiringItems(userId) {
  const { today, next7Days } = expiryDateRange();

  const expiringItems = await pantryModel
    .find({
      user: userId,
      expiryDate: { $gte: today, $lte: next7Days },
    })
    .sort({ expiryDate: 1 })
    .limit(5);

  return expiringItems;
}

module.exports = {
  getExpiringItems,
  expiryDateRange,
  getExpiryStatus,
  groupByExpiryStatus,
};
