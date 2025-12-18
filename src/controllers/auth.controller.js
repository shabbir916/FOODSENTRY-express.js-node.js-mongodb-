const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOTP");
const { resetPasswordEmail } = require("../emails");
const { WelcomeEmail } = require("../emails");

async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;

    const isExistingUser = await userModel.findOne({
      email,
    });

    if (isExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token);

    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to FOODSENTRY",
        html: WelcomeEmail({
          name: user.username,
        }),
      });
    } catch (emailError) {
      console.error("Welcome Error Failed:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while Registering User",
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel
      .findOne({
        email,
      })
      .select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token);

    return res.status(200).json({
      success: true,
      message: "User Loggedin Successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error While logging-in User",
    });
  }
}

async function logoutUser(req, res) {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      success: true,
      message: "User Logged-out Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while Logging-Out",
    });
  }
}

async function forgetPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No user found with this email",
      });
    }

    // 1) Generate OTP
    const otp = generateOTP();

    const hashedOTP = await bcrypt.hash(otp, 10);

    user.otp = hashedOTP;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min

    await user.save();

    console.log("Generated OTP:", otp);

    // 2) Send Email
    await sendEmail({
      to: user.email,
      subject: "FOODSENTRY — Password Reset OTP",
      html: resetPasswordEmail({
        name: user.username,
        otp,
        expiresIn: 5,
      }),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.log("Forget Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error while sending OTP",
    });
  }
}

async function verfiyOTP(req, res) {
  const { email, otp } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found with this email.",
    });
  }

  // OTP missing
  if (!user.otp) {
    return res.status(400).json({
      success: false,
      message: "OTP not available. Please generate a new OTP.",
    });
  }

  // OTP expired
  if (Date.now() > user.otpExpiry) {
    return res.status(400).json({
      success: false,
      message: "OTP Expired. Please generate a new OTP.",
    });
  }

  // Match OTP
  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  // OTP VERIFIED SUCCESSFULLY
  user.otpVerified = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  console.log("VERIFY OTP USER:", user);

  return res.status(200).json({
    success: true,
    message: "OTP Verified Successfully",
  });
}

async function resetPassword(req, res) {
  const { email, newPassword, confirmNewPassword } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found with this email",
    });
  }

  console.log("RESET PASSWORD USER:", user);

  // verifing OTP before resetting password
  if (!user.otpVerified) {
    return res.status(400).json({
      success: false,
      message: "Please verify OTP first",
    });
  }

  // RESET PASSWORD
  const hashNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashNewPassword;

  // Prevent reusing OTP
  user.otpVerified = false;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password Reset Successfully",
  });
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  verfiyOTP,
  resetPassword,
};
