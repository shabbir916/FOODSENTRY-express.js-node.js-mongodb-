const getIngredients = require("../utils/ingredientsManager");
const { getRecipesByIngredients } = require("../services/spoonacular.service");
const pantryModel = require("../models/pantry.model");

async function suggestRecipe(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { ingredients, expiryIngredients, pantryIngredients } = await getIngredients(userId, 10);

    if (!ingredients || ingredients.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No pantry ingredients found. Add items to get recipe suggestions.",
      });
    }

    const rawRecipes = await getRecipesByIngredients(ingredients, 6);

    const filtered = rawRecipes
      .filter((r) => typeof r.missedIngredientCount === "number") 
      .filter((r) => r.missedIngredientCount <= 3) 
      .map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        usedCount: r.usedIngredientCount ?? (r.usedIngredients?.length || 0),
        missedCount: r.missedIngredientCount ?? (r.missedIngredients?.length || 0),
        usedIngredients: (r.usedIngredients || []).map((i) => ({
          name: i.name,
          originalName: i.originalName || i.original,
          image: i.image,
        })),
        missedIngredients: (r.missedIngredients || []).map((i) => ({
          name: i.name,
          originalName: i.originalName || i.original,
          image: i.image,
        })),
      }));

    if (!filtered.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No recipes found for the selected ingredients. Try adding more pantry items.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recipe suggestions fetched",
      data: filtered,
      meta: {
        ingredientsUsedForSearch: ingredients,
        expiryIngredients,
        pantryIngredientsCount: pantryIngredients.length,
      },
    });
  } catch (err) {
    console.error("suggestRecipe error:", err);
    return res.status(500).json({ success: false, message: "Error while fetching recipes" });
  }
}


module.exports = { suggestRecipe };
