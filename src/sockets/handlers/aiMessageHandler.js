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

  // 1) Chat find or create
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

  // 2) STM build
  const stm = buildSTM(chat.messages);

  // 3) Pantry + Expiring + Combined Ingredients
  const ingredientsData = await getIngredients(userId);
  
  let ingredients = ingredientsData.ingredients;
  const pantryIngredients = ingredientsData.pantryIngredients;
  const expiryIngredients = ingredientsData.expiryIngredients;

  console.log("Ingredients BEFORE filtering:", ingredients);

  // 4) Detect avoid ingredients
  const avoidItems = detectAvoidItems(messagePayload.content, ingredients);

  console.log("Avoid Items Detected:", avoidItems);

  // 5) Remove avoid items
  if (avoidItems.length > 0) {
    ingredients = ingredients.filter((i) => !avoidItems.includes(i));
  }

  console.log("Ingredients AFTER filtering:", ingredients);

  // 6) Prompt
  const prompt = buildPrompt({
    avoidItems,
    pantryIngredients,
    expiryIngredients,
    userMessage: messagePayload.content,
  });

  // 7) AI Response
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

  console.log("AI Response:", response);

  // Final object to socket.emit
  return {
    content: response,
    ingredients,
    avoidItems,
  };
}

module.exports = handleAIMessage;
