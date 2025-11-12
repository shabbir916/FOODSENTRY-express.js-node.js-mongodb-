const express = require("express");
const {
  addItem,
  fetchItem,
  updatePantryItem,
  deletePantryItem,
  expiringSoon
} = require("../controllers/pantry.controller");
const {
  validatePantryItem,
  validateUpdatePantryItem,
} = require("../middleware/pantryValidator.middleware");
const authUser = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/add-item", authUser, validatePantryItem, addItem);
router.get("/get-item", authUser, fetchItem);
router.patch(
  "/update-item/:id",
  authUser,
  validateUpdatePantryItem,
  updatePantryItem
);
router.delete("/delete-item/:id", authUser, deletePantryItem);
router.get("/expiring",authUser,expiringSoon)

module.exports = router;
