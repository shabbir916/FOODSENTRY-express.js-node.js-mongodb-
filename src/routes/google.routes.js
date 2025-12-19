const express = require("express");
const authLimiter = require("../middleware/rateLimiter");
const {
  googleAuthURL,
  googleCallback,
} = require("../controllers/google.controller");
const router = express.Router();

router.get("/google", authLimiter, googleAuthURL);
router.get("/google/callback", authLimiter, googleCallback);

module.exports = router;
