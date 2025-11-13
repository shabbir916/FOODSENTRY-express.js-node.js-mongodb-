const { getExpiringItems } = require("../utils/expiryHelper");
const { getRecipesByIngredients } = require("../services/spoonacular.service");
const pantryModel = require("../models/pantry.model");

async function suggestRecipe(req, res) {
  try {
    const userId = req.user?._id;

    const expiringItems = await getExpiringItems(userId);

    // Fetch expiring items
    if (!expiringItems) {
      return res.status(404).json({
        success: false,
        message: "No expiring items found in your pantry",
      });
    }

    const allPantryItems = await pantryModel.find({ user: userId }); // Fetch all pantry items

    const expiringIngredients = expiringItems.map(
      (item) => item.name.trim().toLocaleLowerCase() // ["tomato","cheese"]
    );
    const pantryIngredients = allPantryItems.map(
      (item) => item.name.trim().toLocaleLowerCase() // ["tomato","cheese","pasta","salt"]
    );

    const ingredients = [
      ...new Set([...expiringIngredients, ...pantryIngredients]),
    ].slice(0, 10); // ["tomato","cheese","pasta","salt"]

    const recipes = await getRecipesByIngredients(ingredients);

    console.log("🧾 Ingredients sent to Spoonacular:", ingredients);
    console.log("🔍 Raw Spoonacular recipes:", recipes);

    const filteredRecipes = recipes
      .filter((r) => r.missedIngredientCount <= 2)
      .map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        usedIngredients: r.usedIngredients.map((i) => ({
          name: i.name,
          originalName: i.originalName || i.original,
          image: i.image,
        })),
        missedIngredients: r.missedIngredients.map((i) => ({
          name: i.name,
          originalName: i.originalName,
          image: i.image,
        })),
      }));

    return res.status(200).json({
      success: true,
      message: "Recipe Suggestion fetched Successfully",
      data: filteredRecipes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching recipes",
    });
  }
}

module.exports = { suggestRecipe };
