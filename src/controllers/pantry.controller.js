const pantryModel = require("../models/pantry.model");
const userModel = require("../models/user.model");

async function addItem(req,res) {
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

module.exports = { addItem };
