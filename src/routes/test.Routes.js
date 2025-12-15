const express = require("express");
const router = express.Router();
const transporter = require("../config/email");
const authUser = require("../middleware/auth.middleware");
const pantryModel = require("../models/pantry.model");

router.post("/test-mail", authUser, async (req, res) => {
  try {
    const { itemId, type } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "itemId is required",
      });
    }

    const pantryItem = await pantryModel.findById(itemId);

    if (!pantryItem) {
      return res.status(404).json({
        success: false,
        message: "Pantry item not found",
      });
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: "Test Mail Working",
      text: `Test mail for item: ${pantryItem.name}`,
    });

    if (type === "opened") {
      pantryItem.emailNotifiedOpenExpiry = true;
    } else {
      pantryItem.emailNotified = true;
    }

    await pantryItem.save();

    return res.json({
      success: true,
      message: "Mail sent & DB updated",
      messageId: info.messageId,
    });

  } catch (error) {
    console.error("Test Mail Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
