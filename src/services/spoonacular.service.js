const axios = require("axios");
const API_KEY = process.env.SPOONACULAR_API_KEY;

async function getRecipesByIngredients(ingredients = [], number = 6) {
  try {
    const response = await axios.get(
      "https://api.spoonacular.com/recipes/findByIngredients",
      {
        params: {
          ingredients: ingredients.join(","),
          number,
          apiKey: API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Spoonacular fetch error:", error?.message || error);
    throw new Error("Failed to fetch recipes from Spoonacular");
  }
}

async function getRecipeDetails(id) {
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`,
      {
        params: { apiKey: API_KEY },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Spoonacular details error:", error?.message || error);
    throw new Error("Failed to fetch recipe details");
  }
}

module.exports = { getRecipesByIngredients, getRecipeDetails };
