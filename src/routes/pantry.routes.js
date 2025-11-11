const express = require("express");
const{validatePantryItem} = require("../middleware/pantryValidator.middleware")
const router = express.Router();



module.exports = router