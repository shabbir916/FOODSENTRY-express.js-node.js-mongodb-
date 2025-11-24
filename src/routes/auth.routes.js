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
  resetPassword
} = require("../controllers/auth.controller");
const authUser = require("../middleware/auth.middleware");
const rateLimit = require("express-rate-limit");

const {
  registrationValidation,
  userUpdateValidation,
  chnagePasswordValidation,
  resetPasswordValidator
} = require("../middleware/userValidator.middleware");

const router = express.Router();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many request from this IP, Please try again later",
});

router.post("/register", limiter, registrationValidation, registerUser);
router.post("/login",limiter, loginUser);
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
router.post("/forget-password",authLimiter,forgetPassword);
router.post("/verify-otp",authLimiter,verfiyOTP);
router.post("/reset-password",authLimiter,resetPasswordValidator,resetPassword);

module.exports = router;
module.exports = limiter
