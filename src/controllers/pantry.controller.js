const pantryModel = require("../models/pantry.model");
const {
  getExpiringItems,
  expiryDateRange,
  getExpiryStatus,
  groupByExpiryStatus,
  getOpenExpiryStatus,
} = require("../utils/expiryHelper");
const getExpiringSoonNotifications = require("../utils/expiryNotifications");

async function addItem(req, res) {
  try {
    const userId = req.user?._id;
    const { name, category, quantity, expiryDate, useWithinDays } = req.body;

    const existingItem = await pantryModel.findOne({ name, user: userId });

    if (existingItem) {
      return res.status(401).json({
        success: false,
        message: "Item already exists in your pantry",
      });
    }

    const item = await pantryModel.create({
      name,
      quantity,
      category,
      expiryDate,
      user: userId,
      useWithinDays,
    });

    return res.status(201).json({
      success: true,
      message: "Item added Successfully in your Pantry",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error while adding item in your pantry",
    });
  }
}

async function fetchItem(req, res) {
  try {
    const userId = req.user?._id;

    const items = await pantryModel
      .find({ user: userId })
      .sort({ expiryDate: 1 });

    const formattedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.expiryDate) {
          return { ...item._doc, expiryStatus: "No Expiry" };
        }

        const { diffDays } = await getExpiryStatus(item.expiryDate);

        let expiryStatus = "";

        if (diffDays < 0) {
          expiryStatus = "Expired";
        } else if (diffDays === 0) {
          expiryStatus = "Expires Today";
        } else if (diffDays <= 6) {
          expiryStatus = `in ${diffDays} day(s)`;
        } else {
          expiryStatus = "Fresh";
        }

        const openData = await getOpenExpiryStatus(item);

        return {
          ...item._doc,
          expiryStatus,
          openExpiryDate: openData.openExpiryDate,
          openExpiryStatus: openData.status,
          openExpiryDaysLeft: openData.diffDays,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Pantry Items Fetched Successfully",
      fetchedItem: formattedItems,
    });
  } catch (error) {
    console.error("Fetch Pantry Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error While Fetching Pantry Items",
    });
  }
}

async function updatePantryItem(req, res) {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const updates = req.body;

    const item = await pantryModel.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "No item found",
      });
    }

    if (item.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this item",
      });
    }

    const allowedFields = [
      "name",
      "quantity",
      "category",
      "expiryDate",
      "useWithinDays",
    ];
    const invalidFields = Object.keys(updates).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      return res.status(401).json({
        success: false,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      });
    }

    const updatedItem = await pantryModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Item(s) updated successfully",
      updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error While Updating Pantry Item(s)",
    });
  }
}

async function deletePantryItem(req, res) {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const item = await pantryModel.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in your pantry",
      });
    }

    if (item.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! you can not delete this item",
      });
    }

    const deletedItem = await pantryModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Item Deleted Successfully from your pantry",
      deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error While Deleting the Item",
    });
  }
}

async function markOpen(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const item = await pantryModel.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.user.toString() !== userId.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await pantryModel.findByIdAndUpdate(
      id,
      {
        opened: true,
        openedAt: new Date(),
        emailNotifiedOpenExpiry: false,
      },
      { new: true }
    );

    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
}

async function expiringSoon(req, res) {
  try {
    const userId = req.user?._id;

    const expiringItems = await getExpiringItems(userId);

    return res.status(200).json({
      success: true,
      message: "Items Expiring Soon",
      expiringItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error While fecthing Expiry Items From your Pantry",
    });
  }
}

async function expiryStatus(req, res) {
  try {
    const userId = req.user?._id;

    const items = await pantryModel.find({ user: userId });

    const groups = await groupByExpiryStatus(items);

    return res.status(200).json({
      success: true,
      expiringToday: groups.expiringToday,
      expiringSoon: groups.expiringSoon,
      fresh: groups.fresh,
      expired: groups.expired,
    });
  } catch (error) {
    console.error("Expiry Status Error", error);
    res.status(500).json({
      success: false,
      message: "Server Error While Fethcing Expiry Status",
    });
  }
}

async function getExpiryItemsNotification(req, res) {
  try {
    const userId = req.user?._id;

    const notifications = await getExpiringSoonNotifications(userId);

    return res.status(200).json({
      success: true,
      message: "Expiry Notification sent to user",
      expiringSoon: notifications,
    });
  } catch (error) {
    console.error("Notification Error", error);
    res.status(500).json({
      success: false,
      message: "Server Error While notifiying user",
    });
  }
}

module.exports = {
  addItem,
  fetchItem,
  updatePantryItem,
  deletePantryItem,
  expiringSoon,
  expiryStatus,
  getExpiryItemsNotification,
  markOpen
};
