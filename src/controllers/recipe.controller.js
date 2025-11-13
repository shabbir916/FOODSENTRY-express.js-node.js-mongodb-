const { getExpiringItems } = require("../utils/expiryHelper");
const { getRecipesByIngredients } = require("../services/spoonacular.service");
const pantryModel = require("../models/pantry.model");

async function suggestRecipe(req, res) {
  try {
    const userId = req.user?._id;

    const expiringItems = await getExpiringItems(userId);

    if (!expiringItems) {
      return res.status(404).json({
        success: false,
        message: "No expiring items found in your pantry",
      });
    }

    const allPantryItems = await pantryModel.find({ user: userId });

    const expiryIngridents = expiringItems.map((item) =>
      item.name.toLocaleLowerCase()
    );
    const pantryIngridents = allPantryItems.map((item) =>
      item.name.toLocaleLowerCase()
    );

    const ingredients = [
      ...new Set([...expiryIngridents, ...pantryIngridents]),
    ];

    const recipes = await getRecipesByIngredients(ingredients);

    console.log("🧾 Ingredients sent to Spoonacular:", ingredients);
    console.log("🔍 Raw Spoonacular recipes:", recipes);

    const filteredRecipe = recipes
      .filter((r) => r.missedIngredientCount <= 2)
      .map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        usedIngredients: r.usedIngredients.map((i) => ({
          name: i.name,
          originalName: i.originalName,
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
      data: filteredRecipe,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching recipes",
    });
  }
}

module.exports = { suggestRecipe };
