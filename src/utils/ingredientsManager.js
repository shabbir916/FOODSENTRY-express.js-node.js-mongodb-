const pantryModel = require("../models/pantry.model");
const { getExpiringItems } = require("./expiryHelper");

async function getIngredients(userId, limit = 10) {
  if (!userId) return { pantryIngredients: [], expiryIngredients: [], ingredients: [] };

  const allPantry = await pantryModel.find({ user: userId }).lean();
  const expiring = await getExpiringItems(userId); // uses your helper (next 7 days) and returns limited 5

  const normalize = (s) => (s || "").toString().trim().toLowerCase();

  const pantryIngredients = Array.from(
    new Set(allPantry.map((i) => normalize(i.name)).filter(Boolean))
  );

  const expiryIngredients = Array.from(
    new Set(expiring.map((i) => normalize(i.name)).filter(Boolean))
  );

  
  const combined = [...expiryIngredients, ...pantryIngredients.filter((p) => !expiryIngredients.includes(p))];

  const ingredients = combined.slice(0, limit);

  return {
    pantryIngredients,
    expiryIngredients,
    ingredients,
  };
}

module.exports = getIngredients;
