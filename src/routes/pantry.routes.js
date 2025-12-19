const express = require("express");
const {
  addItem,
  fetchItem,
  updatePantryItem,
  deletePantryItem,
  expiringSoon,
  expiryStatus,
  getExpiryItemsNotification,
} = require("../controllers/pantry.controller");
const {
  validatePantryItem,
  validateUpdatePantryItem,
} = require("../middleware/pantryValidator.middleware");
const authUser = require("../middleware/auth.middleware");
const authLimiter = require("../middleware/rateLimiter");

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
router.get("/expiring", authUser, expiringSoon);
router.get("/expiry-status", authUser, expiryStatus);
router.get("/notifications", authLimiter,authUser, getExpiryItemsNotification);

module.exports = router;
