const authUser = require("../middleware/auth.middleware");
const {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  updateEmailPreferences,
} = require("../controllers/auth.controller");
const {
  userUpdateValidation,
  chnagePasswordValidation,
} = require("../middleware/userValidator.middleware");

router.get("/user-profile", authUser, fetchUserProfile);
router.patch(
  "/update-profile",
  authUser,
  userUpdateValidation,
  updateUserProfile
);
router.patch(
  "/change-password",
  authUser,
  chnagePasswordValidation,
  changePassword
);
router.patch("/email-preferences", authUser, updateEmailPreferences);
