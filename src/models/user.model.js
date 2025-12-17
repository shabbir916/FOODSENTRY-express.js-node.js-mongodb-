const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    otp: {
      type: String,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    otpExpiry: {
      type: Date,
    },
    resetToken: {
      type: String,
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: { type: String, default: null },
    emailPreferences: {
      expiryAlerts: {
        type: Boolean,
        default: true,
      },
      welcomeEmail: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
