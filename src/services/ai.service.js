const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function generateRecipesSuggestion({ ingredients, userPrompt }) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: {
      role: "user",
      parts: [
        { text: `Pantry ingredients: ${ingredients.join(", ")}` },
        { text: `User question: ${userPrompt}` },
      ],
    },
    config: {
      temperature: 0.7,
      systemInstruction: `
You are FoodSentry — a professional chef assistant.
Your job:
1. ALWAYS prioritize expiring ingredients first.
2. Combine expiring + other pantry items to suggest realistic recipes.
3. Suggest ONLY dishes that can be made using the listed ingredients.
4. If something is missing, offer simple substitutes.
5. Keep recipes short, clear, 3-step style, and beginner-friendly.
6. Never hallucinate ingredients the user doesn't have.
7. Follow the user’s query strictly (e.g., “I don’t have pasta”, “quick recipe”, “healthy option”).
8. Give exactly 3 recipes with title, used ingredients, and simple steps.
`,
    },
  });

  return response.text;
}

module.exports = {
  generateRecipesSuggestion,
};
