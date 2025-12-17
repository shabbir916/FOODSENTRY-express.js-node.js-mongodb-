const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  forgetPassword,
  verfiyOTP,
  resetPassword,
} = require("../controllers/auth.controller");
const authUser = require("../middleware/auth.middleware");

const {
  registrationValidation,
  userUpdateValidation,
  chnagePasswordValidation,
  resetPasswordValidator,
} = require("../middleware/userValidator.middleware");
const authLimiter = require("../middleware/rateLimiter");
const router = express.Router();

router.post("/register", authLimiter, registrationValidation, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/user-profile", authUser, fetchUserProfile);
router.patch(
  "/update-profile/:id",
  authUser,
  userUpdateValidation,
  updateUserProfile
);
router.patch(
  "/change-password",
  authUser,
  chnagePasswordValidation,
  changePassword
);
router.post("/logout", authUser, logoutUser);
router.post("/forget-password", authLimiter, forgetPassword);
router.post("/verify-otp", authLimiter, verfiyOTP);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidator,
  resetPassword
);
router.patch("/email-preferences",authUser,EmailPreferrenceController)

module.exports = router;
