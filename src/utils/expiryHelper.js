const pantryModel = require("../models/pantry.model");

function expiryDateRange() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const next7Days = new Date(today);
  next7Days.setUTCDate(today.getUTCDate() + 7);
  next7Days.setUTCHours(0, 0, 0, 0);

  return { today, next7Days };
}

function computeOpenedExpiryDate(openedOn, useWithinDays) {
  if (!openedOn || !useWithinDays) return null;

  const d = new Date(openedOn);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + useWithinDays);

  return d;
}

function computeFinalExpiryDate(expiryDate, openedExpiryDate) {
  if (expiryDate && openedExpiryDate) {
    const e1 = new Date(expiryDate);
    const e2 = new Date(openedExpiryDate);

    e1.setUTCHours(0, 0, 0, 0);
    e2.setUTCHours(0, 0, 0, 0);

    return new Date(Math.min(e1.getTime(), e2.getTime()));
  }

  if (expiryDate) {
    const d = new Date(expiryDate);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  if (openedExpiryDate) {
    const d = new Date(openedExpiryDate);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  return null;
}

async function getExpiryStatus(targetDate) {
  const { today } = expiryDateRange();

  if (!targetDate) {
    return { status: "No Expiry", diffDays: null };
  }

  const d = new Date(targetDate);
  d.setUTCHours(0, 0, 0, 0);

  let diffDays = Math.floor(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let status = "Fresh";

  if (diffDays < 0) {
    status = "Expired";
    diffDays = 0;
  } else if (diffDays === 0) {
    status = "Expiring Today";
  } else if (diffDays >= 1 && diffDays <= 6) {
    status = "Expiring Soon";
  }

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

  const expirySource =
    openedExpiryDate &&
    finalExpiryDate &&
    openedExpiryDate.getTime() === finalExpiryDate.getTime()
      ? "opened"
      : "original";

  return {
    ...item._doc,
    openedExpiryDate,
    finalExpiryDate,
    expiryStatus: status,
    daysLeft: diffDays,
    expirySource,
  };
}

async function getExpiringItems(userId) {
  const items = await pantryModel.find({ user: userId });

  const enriched = await Promise.all(
    items.map((item) => attachExpiryComputedFields(item))
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
    items.map((i) => attachExpiryComputedFields(i))
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
