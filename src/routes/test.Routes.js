const express = require("express");
const router = express.Router();
const transporter = require("../config/email");
const authUser = require("../middleware/auth.middleware");

router.get("/test-mail", authUser, async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Mail Working",
      text: "Hello, your mail setup is working perfectly!",
    });

    return res.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
