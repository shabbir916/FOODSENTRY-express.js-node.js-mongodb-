const express = require("express");
const authUser = require("../middleware/auth.middleware");
const { suggestRecipe } = require("../controllers/recipe.controller");

const router = express.Router();

router.get("/suggestions", authUser, suggestRecipe);

module.exports = router;
