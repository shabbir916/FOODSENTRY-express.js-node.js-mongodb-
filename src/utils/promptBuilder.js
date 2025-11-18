function buildPrompt({ avoidItems, pantryIngredients, expiryIngredients, userMessage }) {
  return `
Your task:
- Suggest realistic recipes using ONLY the available ingredients.
- The user wants to AVOID these items: ${avoidItems.join(", ") || "none"}.
- Use PANTRY items: ${pantryIngredients.join(", ")}.
- PRIORITIZE expiring items: ${expiryIngredients.join(", ")}.
- Never include avoided ingredients.

User message: "${userMessage}"
  `;
}

module.exports = buildPrompt;
