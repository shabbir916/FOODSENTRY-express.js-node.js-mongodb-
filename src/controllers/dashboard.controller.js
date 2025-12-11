const pantryModel = require("../models/pantry.model");
const { expiryDateRange, attachExpiryComputedFields } = require("../utils/expiryHelper");

async function getOverview(req, res) {
  try {
    const userId = req.user._id;

    const items = await pantryModel.find({ user: userId });
    const enriched = await Promise.all(items.map((i) => attachExpiryComputedFields(i)));

    const totalItems = enriched.length;
    const expiringSoon = enriched.filter((i) => i.expiryStatus === "Expiring Soon" || i.expiryStatus === "Expiring Today").length;
    const expiredItems = enriched.filter((i) => i.expiryStatus === "Expired").length;

    return res.status(200).json({ success: true, totalItems, expiringSoon, expiredItems });
  } catch (error) {
    console.error("getOverview error:", error);
    return res.status(500).json({ success: false, message: "Server Error while fetching total,expiringSoon and expired Items from pantry" });
  }
}

async function getSummary(req, res) {
  try {
    const userId = req.user._id;
    const items = await pantryModel.find({ user: userId });
    const enriched = await Promise.all(items.map((i) => attachExpiryComputedFields(i)));

    const { today } = expiryDateRange();

    const forecast = {};
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
      dayEnd.setHours(0, 0, 0, 0);

      const count = enriched.filter((it) => it.finalExpiryDate && it.finalExpiryDate >= dayStart && it.finalExpiryDate < dayEnd).length;
      const label = dayStart.toLocaleDateString("en-US", { weekday: "short" });
      forecast[label] = count;
    }

    return res.status(200).json({ success: true, forecast });
  } catch (error) {
    console.error("getSummary error:", error);
    return res.status(500).json({ success: false, message: "Server Error while fetching Pantry Summary" });
  }
}

module.exports = { getOverview, getSummary };
