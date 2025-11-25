const express = require("express");
const authUser = require("../middleware/auth.middleware");
const{getOverview,getSummary,getExpiringSoonList} = require("../controllers/dashboard.controller");
const router = express.Router();

router.get("/overview",authUser,getOverview);
router.get("/summary",authUser,getSummary);
router.get("/expiring-soon-list",authUser,getExpiringSoonList);

module.exports = router;
