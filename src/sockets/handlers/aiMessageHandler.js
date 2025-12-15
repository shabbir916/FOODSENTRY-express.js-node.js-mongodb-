// const pantryModel = require("../../models/pantry.model");
const chatModel = require("../../models/chat.model");
const aiService = require("../../services/ai.service");
// const { getExpiringItems } = require("../../utils/expiryHelper");

const buildSTM = require("../../utils/stmBuilder");
const getIngredients = require("../../utils/ingredientsManager");
const detectAvoidItems = require("../../utils/avoidItemDetector");
const buildPrompt = require("../../utils/promptBuilder");

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

  const response = await aiService.generateRecipesSuggestion({
    stm,
    ingredients,
    userPrompt: prompt,
    avoidItems,
  });

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
