const { Server } = require("socket.io");
const socketAuth = require("../middleware/socketAuth.middleware");
const handleAIMessage = require("./handlers/aiMessageHandler");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  // Socket Auth
  io.use(socketAuth);

  // Events
  io.on("connection", (socket) => {
    console.log("User connected:", socket.user._id);

    socket.on("ai-message", async (messagePayload) => {
      const response = await handleAIMessage(socket, messagePayload);
      socket.emit("ai-response", response);
    });
  });
}

module.exports = initSocketServer;
