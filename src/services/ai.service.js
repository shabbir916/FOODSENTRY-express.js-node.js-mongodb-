const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function generateRecipesSuggestion({
  stm,
  ingredients,
  avoidItems,
  userPrompt,
}) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      ...stm,

      {
        role: "user",
        parts: [
          { text: `Pantry ingredients: ${ingredients.join(", ")}` },
          { text: `Items to AVOID: ${avoidItems.join(", ") || "none"}` },
          { text: `User question: ${userPrompt}` },
        ],
      },
    ],
    config: {
      temperature: 0.7,
      systemInstruction: `    
You are FoodSentry — a professional chef assistant.
Your job:
1. ALWAYS prioritize expiring ingredients first when generating recipes.
2. Use only ingredients from the provided “available ingredients” list.
3. STRICT RULE: Never use ingredients listed under “avoid items”. Not in steps, not in alternatives, not even in suggestions.
4. Combine expiring + other pantry items to create simple, realistic recipes.
5. If something is missing, offer substitutes ONLY if they are already in the pantry.
6. Recipes must be short, clear, beginner-friendly, and preferably 3 steps.
7. Never hallucinate ingredients the user does not have.
8. Follow the user’s latest query strictly, even if previous messages say something different.
9. Provide exactly 3 recipe suggestions with:
   - Title
   - Used ingredients
   - Simple steps
10. If the user says “quick”, “healthy”, “spicy”, etc., adapt all 3 recipes accordingly.
11. If pantry has pasta, do NOT always recommend pasta — provide variety.
12. Avoid items must NEVER appear in:
   - Titles
   - Ingredients
   - Steps
   - Alternatives
   - Suggestions
`,
    },
  });

  return response.text;
}

module.exports = {
  generateRecipesSuggestion,
};
