function detectAvoidItems(userText, ingredients) {
  userText = userText.toLowerCase();

  const avoidPatterns = [
    "no ",
    "without ",
    "avoid ",
    "don't use ",
    "do not use ",
    "mat ",
    "nahi ",
    "not include ",
    "skip ",
    "remove ",
    "except ",
  ];

  let avoidItems = [];

  ingredients.forEach((item) => {
    avoidPatterns.forEach((pattern) => {
      if (userText.includes(pattern + item)) {
        avoidItems.push(item);
      }
    });
  });

  return [...new Set(avoidItems)];
}

module.exports = detectAvoidItems;
