const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  verfiyOTP,
  resetPassword,
} = require("../controllers/auth.controller");
const authUser = require("../middleware/auth.middleware");

const {
  registrationValidation,
  resetPasswordValidator,
} = require("../middleware/userValidator.middleware");
const authLimiter = require("../middleware/rateLimiter");
const router = express.Router();

router.post("/register", authLimiter, registrationValidation, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", authUser, logoutUser);
router.post("/forget-password", authLimiter, forgetPassword);
router.post("/verify-otp", authLimiter, verfiyOTP);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidator,
  resetPassword
);

module.exports = router;
