const express = require("express");
const authUser = require("../middleware/auth.middleware");
const { suggestRecipe } = require("../controllers/recipe.controller");
const authLimiter = require("../middleware/rateLimiter");

const router = express.Router();

router.get("/suggestions", authLimiter, authUser, suggestRecipe);

module.exports = router;
