const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const pantryModel = require("../models/pantry.model");
const chatModel = require("../models/chat.model");
const aiService = require("../services/ai.service");
const { getExpiringItems } = require("../utils/expiryHelper");

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

  io.on("connection", (socket) => {
    // console.log("user Connected:", Socket.user)
    // console.log("New Socket Connection:", Socket.id);

    socket.on("ai-message", async (messagePayload) => {
      console.log(messagePayload);

       const userId = socket.user._id;

      let chat = await chatModel.findOne({
        user: userId,
        isActive: true,
      });

      if (!chat) {
        chat = await chatModel.create({ user:userId });
      }

      chat.messages.push({
        role: "user",
        content: messagePayload.content,
      });
      await chat.save();

      const recentMessages = chat.messages.slice(-10);

      const stm = recentMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const expiringItems = await getExpiringItems(userId);
      const allPantryItems = await pantryModel.find({
        user:userId,
      });

      const expiryIngredients = expiringItems.map((item) =>
        item.name.trim().toLocaleLowerCase()
      );
      const pantryIngredients = allPantryItems.map((item) =>
        item.name.trim().toLocaleLowerCase()
      );

      const ingredients = [
        ...new Set([...expiryIngredients, ...pantryIngredients]),
      ];

      console.log("🧾 Ingredients going to AI:", ingredients);

      // Build AI prompt
      const prompt = `
    My pantry contains these items: ${pantryIngredients.join(", ")}.
    These items are expiring soon: ${expiryIngredients.join(", ")}.
    Based on these, suggest some recipes.
    User message: "${messagePayload.content}"
  `;

      const response = await aiService.generateRecipesSuggestion({
        stm,
        ingredients: ingredients,
        userPrompt: prompt,
      });

      chat.messages.push({
        role: "model",
        content: response,
      });
      await chat.save();

      console.log("AI Response:", response);

      socket.emit("ai-response", {
        content: response,
        ingredients,
      });
    });
  });
}

module.exports = initSocketServer;
