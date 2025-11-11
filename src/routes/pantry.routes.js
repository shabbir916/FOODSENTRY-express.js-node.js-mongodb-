const express = require("express");
const { addItem } = require("../controllers/pantry.controller");
const {
  validatePantryItem,
} = require("../middleware/pantryValidator.middleware");
const authUser = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/add-item", authUser, validatePantryItem, addItem);

module.exports = router;
