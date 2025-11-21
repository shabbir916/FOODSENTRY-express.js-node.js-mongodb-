const express = require("express");
const {
  googleAuthURL,
  googleCallback,
} = require("../controllers/google.controller");
const router = express.Router();

router.get("/google", googleAuthURL);
router.get("/google/callback", googleCallback);

module.exports = router;
