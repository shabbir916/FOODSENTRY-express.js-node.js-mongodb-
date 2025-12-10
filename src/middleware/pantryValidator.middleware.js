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

function notFutureDate(value) {
  const today = new Date();
  const openDate = new Date(value);
  openDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (openDate > today) {
    throw new Error("Date cannot be in future");
  }
  return true;
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
    .withMessage("Expiry date must be a valid date (YYYY-MM-DD)")
    .custom((value) => {
      const today = new Date();
      const expiry = new Date(value);

      if (expiry < today) {
        throw new Error("Expiry date cannot be in the past");
      }
      return true;
    }),
  body("useWithinDays")
    .optional()
    .isInt({ min: 1 })
    .withMessage("UseWithinDays must be a positive number"),
  body("opened")
    .optional()
    .isBoolean()
    .withMessage("opened must be true or false"),
  body("openedOn")
    .optional()
    .isISO8601()
    .withMessage("openedOn must be a valid date (YYYY-MM-DD)")
    .custom((value, { req }) => {
      if (req.body.opened === false && value) {
        throw new Error("openedOn cannot be provided if item is not Opened");
      }
      return notFutureDate(value);
    }),
  body().custom((_, { req }) => {
    if (req.body.opened === true) {
      if (
        typeof req.body.useWithinDays === "undefined" ||
        req.body.useWithinDays === null ||
        Number.isNaN(Number(req.body.useWithinDays))
      ) {
        throw new Error("When opened is true, useWithinDays is required");
      }
    }
    return true;
  }),
  validate,
];

const validateUpdatePantryItem = [
  body("name")
    .optional()
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
    .withMessage("Expiry date must be a valid date (YYYY-MM-DD)")
    .custom((value) => {
      const today = new Date();
      const expiry = new Date(value);

      if (expiry < today) {
        throw new Error("Expiry date cannot be in the past");
      }
      return true;
    }),
  body("useWithinDays")
    .optional()
    .isInt({ min: 1 })
    .withMessage("UseWithinDays must be a positive number"),
  body("opened")
    .optional()
    .isBoolean()
    .withMessage("opened must be true or false"),
  body("openedOn")
    .optional()
    .isISO8601()
    .withMessage("openedOn must be a valid date (YYYY-MM-DD)")
    .custom((value, { req }) => {
      if (req.body.opened === false && value) {
        throw new Error("openedOn cannot be provided if item is not Opened");
      }
      return notFutureDate(value);
    }),
  validate,
];

module.exports = {
  validatePantryItem,
  validateUpdatePantryItem,
};
