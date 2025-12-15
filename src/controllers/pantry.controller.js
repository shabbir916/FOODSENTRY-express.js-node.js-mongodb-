const pantryModel = require("../models/pantry.model");
const {
  computeOpenedExpiryDate,
  computeFinalExpiryDate,
  attachExpiryComputedFields,
  getExpiringItems,
  groupByExpiryStatus,
} = require("../utils/expiryHelper");
const getExpiringSoonNotifications = require("../utils/expiryNotifications");

async function addItem(req, res) {
  try {
    const userId = req.user._id;
    const {
      name,
      category,
      quantity,
      expiryDate,
      opened,
      openedOn,
      useWithinDays,
    } = req.body;

    const existingItem = await pantryModel.findOne({ name, user: userId });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Item already exists in your pantry",
      });
    }

    const isOpened = opened === true || opened === "true";
    let finalOpenedOn = openedOn ? new Date(openedOn) : null;
    if (isOpened && !finalOpenedOn) finalOpenedOn = new Date();

    const finalUseWithinDays = isOpened ? Number(useWithinDays) : null;
    if (isOpened && (!finalUseWithinDays || Number.isNaN(finalUseWithinDays))) {
      return res.status(400).json({
        success: false,
        message: "useWithinDays required when marking item opened.",
      });
    }

    const openedExpiryDate = computeOpenedExpiryDate(
      finalOpenedOn,
      finalUseWithinDays
    );
    const finalExpiryDate = computeFinalExpiryDate(
      expiryDate ? new Date(expiryDate) : null,
      openedExpiryDate
    );

    const item = await pantryModel.create({
      name,
      category,
      quantity,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      user: userId,
      opened: isOpened,
      openedOn: finalOpenedOn,
      useWithinDays: finalUseWithinDays,
      openedExpiryDate,
      finalExpiryDate,
    });

    return res.status(201).json({
      success: true,
      message: "Item added Successfully in your Pantry",
      data: item,
    });
  } catch (error) {
    console.error("addItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error while adding item in your pantry",
    });
  }
}

async function fetchItem(req, res) {
  try {
    const userId = req.user._id;
    const items = await pantryModel
      .find({ user: userId })
      .sort({ finalExpiryDate: 1 });

    if (!items || items.length === 0) {
      return res.status(403).json({
        success: true,
        message: "No Items Found in your Pantry",
      });
    }

    const formattedItems = await Promise.all(
      items.map(async (item) => {
        return await attachExpiryComputedFields(item);
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
    const userId = req.user._id;
    const { id } = req.params;
    const updates = { ...req.body };

    const item = await pantryModel.findById(id);
    if (!item)
      return res.status(404).json({ success: false, message: "No item found" });
    if (item.user.toString() !== userId.toString())
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const allowedFields = [
      "name",
      "quantity",
      "category",
      "expiryDate",
      "opened",
      "openedOn",
      "useWithinDays",
      "emailNotified",
      "emailNotifiedOpenExpiry",
    ];
    const invalidFields = Object.keys(updates).filter(
      (k) => !allowedFields.includes(k)
    );
    if (invalidFields.length)
      return res.status(400).json({
        success: false,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      });

    if (
      typeof updates.expiryDate !== "undefined" &&
      updates.expiryDate !== null
    ) {
      updates.expiryDate = new Date(updates.expiryDate);
    }

    if (typeof updates.opened !== "undefined") {
      updates.opened = updates.opened === true || updates.opened === "true";

      if (!updates.opened) {
        updates.openedOn = null;
        updates.useWithinDays = null;
        updates.openedExpiryDate = null;
        updates.emailNotifiedOpenExpiry = false;
      } else {
        if (!updates.openedOn && !item.openedOn) updates.openedOn = new Date();
        if (!updates.useWithinDays && !item.useWithinDays) {
          return res.status(400).json({
            success: false,
            message: "useWithinDays required when marking item opened.",
          });
        }
        if (!updates.useWithinDays && item.useWithinDays)
          updates.useWithinDays = item.useWithinDays;
      }
    } else {
      if (
        typeof updates.openedOn !== "undefined" &&
        updates.openedOn !== null &&
        !item.opened
      ) {
        updates.opened = true;
      }
      const willBeOpened = updates.opened === true || item.opened === true;
      if (willBeOpened && !updates.useWithinDays && !item.useWithinDays) {
        return res.status(400).json({
          success: false,
          message: "useWithinDays required when marking item opened.",
        });
      }
    }

    const openedOn =
      typeof updates.openedOn !== "undefined"
        ? updates.openedOn
        : item.openedOn;
    const useWithin =
      typeof updates.useWithinDays !== "undefined"
        ? updates.useWithinDays
        : item.useWithinDays;
    const openedExpiryDate = computeOpenedExpiryDate(openedOn, useWithin);

    const finalExpiryDate = computeFinalExpiryDate(
      typeof updates.expiryDate !== "undefined"
        ? updates.expiryDate
        : item.expiryDate,
      openedExpiryDate
    );

    updates.openedExpiryDate = openedExpiryDate;
    updates.finalExpiryDate = finalExpiryDate;

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
    console.error("updatePantryItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error While Updating Pantry Item(s)",
    });
  }
}

async function deletePantryItem(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const item = await pantryModel.findById(id);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    if (item.user.toString() !== userId.toString())
      return res.status(403).json({
        success: false,
        message: "Unauthorized! you can not delete this item",
      });

    const deletedItem = await pantryModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Item Deleted Successfully from your pantry",
      deletedItem,
    });
  } catch (error) {
    console.error("deletePantryItem error:", error);
    return res.status(500).json({
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
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    if (item.user.toString() !== userId.toString())
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const openedOn = item.openedOn || new Date();
    const useWithinDays = item.useWithinDays;
    if (!useWithinDays) {
      return res.status(400).json({
        success: false,
        message:
          "This item does not have useWithinDays configured. Please update item with useWithinDays before marking open.",
      });
    }

    const openedExpiryDate = computeOpenedExpiryDate(openedOn, useWithinDays);
    const finalExpiryDate = computeFinalExpiryDate(
      item.expiryDate,
      openedExpiryDate
    );

    const updated = await pantryModel.findByIdAndUpdate(
      id,
      {
        opened: true,
        openedOn,
        openedExpiryDate,
        finalExpiryDate,
        emailNotifiedOpenExpiry: false,
      },
      { new: true }
    );

    return res.json({ success: true, item: updated });
  } catch (err) {
    console.error("markOpen error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

async function expiringSoon(req, res) {
  try {
    const userId = req.user._id;
    const expiringItems = await getExpiringItems(userId);
    return res
      .status(200)
      .json({ success: true, message: "Items Expiring Soon", expiringItems });
  } catch (error) {
    console.error("expiringSoon error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error While fecthing Expiry Items From your Pantry",
    });
  }
}

async function expiryStatus(req, res) {
  try {
    const userId = req.user._id;
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
    return res.status(500).json({
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
  markOpen,
};
