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
  
}

async function getExpiringSoonList(req, res) {
 
}

module.exports = {
  getOverview,
  getSummary,
  getExpiringSoonList,
};
