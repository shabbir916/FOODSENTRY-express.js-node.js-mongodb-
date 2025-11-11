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

const registrationValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Usernmae is Required")
    .isString()
    .withMessage("Uername must be a string")
    .isLength({ min: 3 })
    .withMessage("Username must be atleast 3 charachters long")
    .isLength({ max: 30 })
    .withMessage("Username cannot exceed above 30 Characters")
    .matches(/^(?!\d+$)[A-Za-z0-9]+$/)
    .withMessage("Username cannot be only numbers"),

  body("email").isEmail().withMessage("Invalid Email Format"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 Characters"),

  validate,
];

const userUpdateValidation = [
  body("username")
    .optional()
    .trim()
    .isString()
    .withMessage("Uername must be a string")
    .isLength({ min: 3 })
    .withMessage("Username must be atleast 3 charachters long")
    .isLength({ max: 30 })
    .withMessage("Username cannot exceed above 30 Characters")
    .matches(/^(?!\d+$)[A-Za-z0-9]+$/)
    .withMessage("Username cannot be only numbers"),

  body("email").optional().isEmail().withMessage("Invalid Email Format"),

  validate,
];

const chnagePasswordValidation = [
  body("oldPassword").notEmpty().withMessage("Old Password is required"),

  body("newPassword")
    .isLength({ min: 3 })
    .withMessage("New Password must be atleast 6 Characters long"),
];

module.exports = {
  registrationValidation,
  userUpdateValidation,
  chnagePasswordValidation
};
