const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function socketAuth(socket, next) {
  try {
    const { token } = cookie.parse(socket.handshake.headers?.cookie || "");

    console.log("Socket connection cookie:", token);

    if (!token) {
      next(new Error("Authentication Error: No token Provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication Error: Invalid Token"));
  }
}

module.exports = socketAuth
