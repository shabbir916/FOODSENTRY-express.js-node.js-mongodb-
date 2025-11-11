const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

async function fetchUserProfile(req, res) {
  try {
    const userId = req.user?._id;

    const UserProfile = await userModel.findById(userId).select("-password");

    return res.status(200).json({
      success: true,
      message: "User profile Fetched successfully",
      data: UserProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error while fetching user-profile",
    });
  }
}

async function updateUserProfile(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ["username", "email"];
    const invalidFields = Object.keys(updates).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      return res.status(401).json({
        success: false,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      });
    }

     if (id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! You can update only your own profile.",
      });
    }

    const updatedProfile = await userModel
      .findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      )
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "User Profile updated Successfully",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error while updating user-profile",
    });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user?._id;
    const { oldPassword, newPassword } = req.body;

    const user = await userModel.findById(userId).select("+password");

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old Password is incorrect",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error While changing Password",
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  fetchUserProfile,
  updateUserProfile,
  changePassword,
};
