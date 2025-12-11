const pantryModel = require("../models/pantry.model");

function expiryDateRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);
  next7Days.setHours(23, 59, 59, 999);

  return { today, next7Days };
}

function computeOpenedExpiryDate(openedOn, useWithinDays) {
  if (!openedOn || !useWithinDays) return null;

  const d = new Date();
  d.setDate(d.getDate() + useWithinDays);
  d.setHours(0, 0, 0, 0);

  return d;
}

function computeFinalExpiryDate(expiryDate, openedExpiryDate) {
  if (expiryDate && openedExpiryDate) {
    return new Date(
      Math.min(
        new Date(expiryDate).getTime(),
        new Date(openedExpiryDate).getTime()
      )
    );
  }
  return expiryDate || openedExpiryDate || null;
}

// async function getExpiryStatus(expiryDate) {
//   const { today } = await expiryDateRange();

//   const expiry = new Date(expiryDate);
//   expiry.setHours(0, 0, 0, 0);

//   const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

//   let status = "";

//   if (diffDays < 0) {
//     status = "Expired";
//   } else if (diffDays === 0) {
//     status = "Expiring Today";
//   } else if (diffDays >= 1 && diffDays <= 6) {
//     status = "Expiring Soon";
//   } else {
//     status = "Fresh";
//   }

//   return { expiry, status, diffDays };
// }

async function getExpiryStatus(targetDate) {
  const { today } = expiryDateRange();
  if (!targetDate) return { status: "No Expiry Status", diffDays: null };

  const d = new Date(targetDate);
  d.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24));

  let status = "Fresh";
  if (diffDays < 0) status = "Expired";
  else if (diffDays === 0) status = "Expiring Today";
  else if (diffDays >= 1 && diffDays <= 6) status = "Expiring Soon";

  return { status, diffDays };
}

async function attachExpiryComputedFields(item) {
  const openedExpiryDate = computeOpenedExpiryDate(
    item.openedOn,
    item.useWithinDays
  );

  const finalExpiryDate = computeFinalExpiryDate(
    item.expiryDate,
    openedExpiryDate
  );

  const { status, diffDays } = await getExpiryStatus(finalExpiryDate);

  return {
    ...item._doc,
    openedExpiryDate,
    finalExpiryDate,
    expiryStatus: status,
    daysLeft: diffDays,
  };
}

// async function groupByExpiryStatus(items) {
//   const groups = {
//     expiringToday: [],
//     expiringSoon: [],
//     fresh: [],
//     expired: [],
//   };

//   for (const item of items) {
//     const { status } = await getExpiryStatus(item.expiryDate);

//     if (status === "Expiring Today") {
//       groups.expiringToday.push(item);
//     } else if (status === "Expiring Soon") {
//       groups.expiringSoon.push(item);
//     } else if (status === "Fresh") {
//       groups.fresh.push(item);
//     } else {
//       groups.expired.push(item);
//     }
//   }

//   return groups;
// }

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
  const items = await pantryModel.find({ user: userId });

  const enriched = await Promise.all(
    items.map(async (item) => await attachExpiryComputedFields(item))
  );

  return enriched
    .filter(
      (i) =>
        i.expiryStatus === "Expiring Today" ||
        i.expiryStatus === "Expiring Soon"
    )
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);
}

async function groupByExpiryStatus(items) {
  const enriched = await Promise.all(
    items.map(async (i) => await attachExpiryComputedFields(i))
  );

  return {
    expiringToday: enriched.filter((i) => i.expiryStatus === "Expiring Today"),
    expiringSoon: enriched.filter((i) => i.expiryStatus === "Expiring Soon"),
    fresh: enriched.filter((i) => i.expiryStatus === "Fresh"),
    expired: enriched.filter((i) => i.expiryStatus === "Expired"),
  };
}

module.exports = {
  expiryDateRange,
  computeOpenedExpiryDate,
  computeFinalExpiryDate,
  getExpiryStatus,
  attachExpiryComputedFields,
  getExpiringItems,
  groupByExpiryStatus,
};
