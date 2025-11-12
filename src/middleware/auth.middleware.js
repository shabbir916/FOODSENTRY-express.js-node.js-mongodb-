const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authUser(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access,Please login first",
      });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized User, Invalid token",
    });
  }
}

module.exports = authUser;
