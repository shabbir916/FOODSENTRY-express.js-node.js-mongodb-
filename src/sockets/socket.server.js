const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const { token } = cookie.parse(socket.handshake.headers?.cookie || " ");

    console.log("Socket connection cookie:", token);

    if (!token) {
      next(new Error("Authentication Error:No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication Error:Invalid token"));
    }
  });

  io.on("connection", (Socket) => {
    console.log("New Socket Connection:", Socket.id);
  });
}

module.exports = initSocketServer;
