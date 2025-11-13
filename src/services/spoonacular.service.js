const axios = require("axios");
const API_KEY = process.env.SPOONACULAR_API_KEY;

// Fetch recipes based on ingredients
async function getRecipesByIngredients(ingredients) {
  try {
    const response = await axios.get(
      "https://api.spoonacular.com/recipes/findByIngredients",
      {
        params: {
          ingredients: ingredients.join(","),
          number: 3,
          apiKey: API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching recipes:", error.message);
    throw new Error("Failed to fetch recipes from Spoonacular");
  }
}

// Fetch recipe details
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
    console.error("Error fetching recipe details:", error.message);
    throw new Error("Failed to fetch recipe details");
  }
}

module.exports = {
  getRecipesByIngredients,
  getRecipeDetails,
};
