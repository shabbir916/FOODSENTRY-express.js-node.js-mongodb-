const express = require("express");
const limiter = require("../routes/auth.routes");
const {
  googleAuthURL,
  googleCallback,
} = require("../controllers/google.controller");
const router = express.Router();

router.get("/google", limiter, googleAuthURL);
router.get("/google/callback", googleCallback);

module.exports = router;
