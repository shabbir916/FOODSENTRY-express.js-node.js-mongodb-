const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");

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
    const userId = req.user?._id; 
    const updates = req.body;

    const allowedFields = ["username", "email"];
    const invalidFields = Object.keys(updates).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      });
    }

    const updatedProfile = await userModel
      .findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      )
      .select("-password");

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating user profile",
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

async function updateEmailPreferences(req, res) {
  try {
    const userId = req.user?._id;
    const { expiryAlerts, welcomeEmail, marketing } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    if (typeof expiryAlerts === "boolean") {
      user.emailPreferences.expiryAlerts = expiryAlerts;
    }

    if (typeof welcomeEmail === "boolean") {
      user.emailPreferences.welcomeEmail = welcomeEmail;
    }

    if (typeof marketing === "boolean") {
      user.emailPreferences.marketing = marketing;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email Preferences Updated Successfully",
      data: user.emailPreferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error while updating User Email Preferences",
    });
  }
}

module.exports = {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  updateEmailPreferences,
};
