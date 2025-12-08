const express = require("express");
const router = express.Router();
const sendExpiryEmails = require("../jobs/expiryEmailJob");

router.get("/test-mail", async (req, res) => {
  try {
    await sendExpiryEmails();
    res.json({ success: true, message: "Mail Triggered!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
