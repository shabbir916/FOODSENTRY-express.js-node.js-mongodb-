const express = require("express");
const authUser = require("../middleware/auth.middleware");
const {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  updateEmailPreferences,
} = require("../controllers/user.controller");
const {
  userUpdateValidation,
  chnagePasswordValidation,
} = require("../middleware/userValidator.middleware");
const authLimiter = require("../middleware/rateLimiter");

const router = express.Router();

router.get("/user-profile", authUser, fetchUserProfile);
router.patch(
  "/update-profile",
  authUser,
  userUpdateValidation,
  updateUserProfile
);
router.patch(
  "/change-password",
  authUser,
  authLimiter,
  chnagePasswordValidation,
  changePassword
);
router.patch("/email-preferences", authUser, updateEmailPreferences);

module.exports = router;
