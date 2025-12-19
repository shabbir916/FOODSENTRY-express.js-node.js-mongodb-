const express = require("express");
const authUser = require("../middleware/auth.middleware");
const authLimiter = require("../middleware/rateLimiter");
const {
  getOverview,
  getSummary,
} = require("../controllers/dashboard.controller");
const router = express.Router();

router.get("/overview", authLimiter, authUser, getOverview);
router.get("/summary", authLimiter, authUser, getSummary);
// router.get("/expiring-soon-list",authUser,authLimiter,getExpiringSoonList);

module.exports = router;
