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
    socket.on("ai-message", async (messagePayload) => {
      console.log("📥 Incoming:", messagePayload);

      const userId = socket.user._id;

      // Find or create chat session

      let chat = await chatModel.findOne({ user: userId, isActive: true });

      if (!chat) {
        chat = await chatModel.create({ user: userId });
      }

      // Save user message
      chat.messages.push({
        role: "user",
        content: messagePayload.content,
      });
      await chat.save();

      // STM (last 10 messages)

      const recentMessages = chat.messages.slice(-10);

      const stm = recentMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      // 3️⃣ Fetch pantry + expiring ingredients

      const expiringItems = await getExpiringItems(userId);
      const allPantryItems = await pantryModel.find({ user: userId });

      const expiryIngredients = expiringItems.map((item) =>
        item.name.trim().toLowerCase()
      );

      const pantryIngredients = allPantryItems.map((item) =>
        item.name.trim().toLowerCase()
      );

      let ingredients = [
        ...new Set([...expiryIngredients, ...pantryIngredients]),
      ];

      console.log("🧾 Ingredients BEFORE filtering:", ingredients);

      
      // Aviod Ingredients
      
      const userText = messagePayload.content.toLowerCase();

      const avoidPatterns = [
        "no ",
        "without ",
        "avoid ",
        "don't use ",
        "do not use ",
        "mat ",
        "nahi ",
        "not include ",
        "skip ",
        "remove ",
        "except ",
      ];

      let avoidItems = [];

      ingredients.forEach((item) => {
        avoidPatterns.forEach((pattern) => {
          if (userText.includes(pattern + item)) {
            avoidItems.push(item);
          }
        });
      });

      avoidItems = [...new Set(avoidItems)];

      console.log("🚫 Avoid Items Detected:", avoidItems);

      
      //  Remove avoid items from ingredients
      
      if (avoidItems.length > 0) {
        ingredients = ingredients.filter((i) => !avoidItems.includes(i));
      }

      console.log("🧾 Ingredients AFTER filtering:", ingredients);

      
      // Build AI prompt
      
      const prompt = `
Your task:
- Suggest realistic recipes using ONLY the available ingredients.
- The user wants to AVOID these items: ${avoidItems.join(", ") || "none"}.
- Use PANTRY items: ${pantryIngredients.join(", ")}.
- PRIORITIZE expiring items: ${expiryIngredients.join(", ")}.
- Never include avoided ingredients.

User message: "${messagePayload.content}"
    `;

      
      // Get AI response
      
      const response = await aiService.generateRecipesSuggestion({
        stm,
        ingredients,
        userPrompt: prompt,
        avoidItems,
      });

      
      // Save AI message
      
      chat.messages.push({
        role: "model",
        content: response,
      });

      await chat.save();

      console.log("🤖 AI Response:", response);

      
      // Send response back to frontend
      
      socket.emit("ai-response", {
        content: response,
        ingredients,
        avoidItems,
      });
    });
  });
}

module.exports = initSocketServer;
