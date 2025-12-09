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

  let status = "";

  if (diffDays < 0) {
    status = "Expired";
  } else if (diffDays === 0) {
    status = "Expiring Today";
  } else if (diffDays >= 1 && diffDays <= 6) {
    status = "Expiring Soon";
  } else {
    status = "Fresh";
  }

  return { expiry, status, diffDays };
}

function computeOpenExpiryDate(openedAt, useAfterOpeningDays) {
  if (!openedAt || !useAfterOpeningDays) return null;

  const date = new Date(openedAt);
  date.setDate(date.getDate() + useAfterOpeningDays);
  date.setHours(0, 0, 0, 0);

  return date;
}

async function getOpenExpiryStatus(item) {
  if (!item.opened || !item.openedAt || !item.useAfterOpeningDays) {
    return { openExpiryDate: null, status: "N/A", diffDays: null };
  }

  const openExpiryDate = computeOpenExpiryDate(
    item.openedAt,
    item.useAfterOpeningDays
  );

  const { status, diffDays } = await getExpiryStatus(openExpiryDate);

  return { openExpiryDate, status, diffDays };
}

async function groupByExpiryStatus(items) {
  const groups = {
    expiringToday: [],
    expiringSoon: [],
    fresh: [],
    expired: [],
  };

  for (const item of items) {
    const { status } = await getExpiryStatus(item.expiryDate);

    if (status === "Expiring Today") {
      groups.expiringToday.push(item);
    } else if (status === "Expiring Soon") {
      groups.expiringSoon.push(item);
    } else if (status === "Fresh") {
      groups.fresh.push(item);
    } else {
      groups.expired.push(item);
    }
  }

  return groups;
}

// async function getExpiringItems(userId) {
//   const { today, next7Days } = expiryDateRange();

//   const expiringItems = await pantryModel
//     .find({
//       user: userId,
//       expiryDate: { $gte: today, $lte: next7Days },
//     })
//     .sort({ expiryDate: 1 })
//     .limit(5);

//   return expiringItems;
// }

async function getExpiringItems(userId) {
  const { today, next7Days } = expiryDateRange();

  let items = await pantryModel.find({ user: userId });

  let result = [];

  for (let item of items) {
    const arr = [];

    // Check original expiry
    if (item.expiryDate) {
      const { status, diffDays } = await getExpiryStatus(item.expiryDate);

      if (status === "Expiring Soon" || status === "Expiring Today") {
        arr.push({
          ...item._doc,
          expiryType: "original",
          daysLeft: diffDays,
        });
      }
    }

    // Check open expiry
    const { openExpiryDate, status, diffDays } = await getOpenExpiryStatus(item);

    if (openExpiryDate && (status === "Expiring Soon" || status === "Expiring Today")) {
      arr.push({
        ...item._doc,
        expiryType: "opened",
        daysLeft: diffDays,
        openExpiryDate,
      });
    }

    result.push(...arr);
  }

  // Sort by nearest expiry
  return result.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);
}


module.exports = {
  getExpiringItems,
  expiryDateRange,
  getExpiryStatus,
  groupByExpiryStatus,
  computeOpenExpiryDate,
  getOpenExpiryStatus
};
