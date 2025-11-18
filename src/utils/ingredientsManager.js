const pantryModel = require("../models/pantry.model");
const { getExpiringItems } = require("./expiryHelper");

async function getIngredients(userId) {
  const expiringItems = await getExpiringItems(userId);
  const allPantryItems = await pantryModel.find({ user: userId });

  const expiryIngredients = expiringItems.map((item) =>
    item.name.trim().toLowerCase()
  );

  const pantryIngredients = allPantryItems.map((item) =>
    item.name.trim().toLowerCase()
  );

  const ingredients = [...new Set([...expiryIngredients, ...pantryIngredients])];

  return { expiryIngredients, pantryIngredients, ingredients };
}

module.exports = getIngredients;
