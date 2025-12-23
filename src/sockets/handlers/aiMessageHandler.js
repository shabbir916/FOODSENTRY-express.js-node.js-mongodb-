const chatModel = require("../../models/chat.model");
const aiService = require("../../services/ai.service");

const buildSTM = require("../../utils/stmBuilder");
const getIngredients = require("../../utils/ingredientsManager");
const detectAvoidItems = require("../../utils/avoidItemDetector");
const buildPrompt = require("../../utils/promptBuilder");

const AI_ENABLED = process.env.AI_ENABLED === "true";

async function handleAIMessage(socket, messagePayload) {
  console.log("Incoming:", messagePayload);

  const userId = socket.user._id;

  let chat = await chatModel.findOne({ user: userId, isActive: true });
  if (!chat) {
    chat = await chatModel.create({ user: userId });
  }

  chat.messages.push({
    role: "user",
    content: messagePayload.content,
  });
  await chat.save();

  const stm = buildSTM(chat.messages);

  const ingredientsData = await getIngredients(userId);

  let ingredients = ingredientsData.ingredients;
  const pantryIngredients = ingredientsData.pantryIngredients;
  const expiryIngredients = ingredientsData.expiryIngredients;

  console.log("Ingredients BEFORE filtering:", ingredients);

  const avoidItems = detectAvoidItems(messagePayload.content, ingredients);
  console.log("Avoid Items Detected:", avoidItems);

  if (avoidItems.length > 0) {
    ingredients = ingredients.filter((i) => !avoidItems.includes(i));
  }

  console.log("Ingredients AFTER filtering:", ingredients);

  const prompt = buildPrompt({
    avoidItems,
    pantryIngredients,
    expiryIngredients,
    userMessage: messagePayload.content,
  });

  if (!AI_ENABLED) {
    const fallbackMessage =
      "AI recipe suggestions are temporarily unavailable. We are working on it. Meanwhile, please explore your pantry items.";

    chat.messages.push({
      role: "system",
      content: fallbackMessage,
    });

    await chat.save();

    socket.emit("ai:message", fallbackMessage);

    return {
      content: fallbackMessage,
      ingredients,
      avoidItems,
      aiDisabled: true,
    };
  }

  let response;

  try {
    response = await aiService.generateRecipesSuggestion({
      stm,
      ingredients,
      userPrompt: prompt,
      avoidItems,
    });
  } catch (error) {
    console.error("AI Error:", error);

    if (error?.status === 429) {
      socket.emit(
        "ai:message",
        "AI is currently busy due to high usage. Please try again shortly."
      );

      return {
        content: null,
        ingredients,
        avoidItems,
        error: "AI_RATE_LIMIT",
      };
    }

    throw error;
  }

  chat.messages.push({
    role: "model",
    content: response,
  });

  await chat.save();

  console.log("AI Response:", response);

  return {
    content: response,
    ingredients,
    avoidItems,
  };
}

module.exports = handleAIMessage;
