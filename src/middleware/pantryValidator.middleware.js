const { body, validationResult } = require("express-validator");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  next();
}

const validatePantryItem = [
  body("name")
    .notEmpty()
    .withMessage("Item name is required")
    .trim()
    .isString()
    .withMessage("Item name must be a string"),

  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),

  body("quantity")
    .optional()
    .isString("Quantity must be text format like '2 kg' or '3 packs'"),

  body("expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Expiry date must be a valid date (YYYY-MM-DD)"),

    validate
];

module.exports = {
    validatePantryItem
}
