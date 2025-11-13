const pantryModel = require("../models/pantry.model");
const { getExpiringItems } = require("../utils/expiryHelper");

async function addItem(req, res) {
  try {
    const userId = req.user?._id;
    const { name, category, quantity, expiryDate } = req.body;

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

    const fetchedItem = await pantryModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    if (!fetchedItem || fetchedItem.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Item not found in your pantry",
        fetchedItem: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pantry Items Fetched Successfully",
      fetchedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error while fetching item's from your pantry",
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

    const allowedFields = ["name", "quantity", "category", "expiryDate"];
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

module.exports = {
  addItem,
  fetchItem,
  updatePantryItem,
  deletePantryItem,
  expiringSoon,
};
