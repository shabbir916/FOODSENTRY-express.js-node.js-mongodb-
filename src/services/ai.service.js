const { GoogleGenAI } = requie("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

async function generateRecipesSuggestion(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: 0.7,
    },
  });
  return response.text;
}

module.exports = {
  generateRecipesSuggestion,
};
