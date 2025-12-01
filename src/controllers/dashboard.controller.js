const pantryModel = require("../models/pantry.model");
const { getExpiringItems, expiryDateRange } = require("../utils/expiryHelper");

async function getOverview(req, res) {
  try {
    const userId = req.user._id;

    const { today, next7Days } = expiryDateRange();

    // Total Items
    const totalItems = await pantryModel.countDocuments({ user: userId });

    // Expiring Soon Items
    const expiringSoon = await pantryModel.countDocuments({
      user: userId,
      expiryDate: { $gte: today, $lte: next7Days },
    });

    // Expired Items
    const expiredItems = await pantryModel.countDocuments({
      user: userId,
      expiryDate: { $lt: today },
    });

    res.status(200).json({
      success: true,
      totalItems,
      expiringSoon,
      expiredItems,
    });
  } catch (error) {
    console.error("server Error", error);
    res.status(500).json({
      success: false,
      message:
        "Server Error while fetching total,expiringSoon and expired Items from pantry",
    });
  }
}

async function getSummary(req, res) {
  try {
    const userId = req.user?._id;

    let forecast = {};

    const { today } = expiryDateRange();

    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(day.getDate() + i);

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const count = await pantryModel.countDocuments({
        user: userId,
        expiryDate: { $gte: day, $lt: nextDay },
      });

      const label = day.toLocaleDateString("en-US", { weekday: "short" });

      forecast[label] = count;
    }
    res.status(200).json({
      success: true,
      forecast,
    });
  } catch (error) {
    console.error("server Error", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching Pantry Summary",
    });
  }
}

async function getExpiringSoonList(req, res) {
  try {
    const userId = req.user?._id;

    const expiringSoonList = await getExpiringItems(userId);

    return res.status(200).json({
      success: true,
      expiringSoonList: expiringSoonList.slice(0, 5),
    });
  } catch (error) {
    console.error("server Error", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching Pantry Summary",
    });
  }
}

module.exports = {
  getOverview,
  getSummary,
  getExpiringSoonList,
};
