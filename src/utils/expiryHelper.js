const pantryModel = require("../models/pantry.model");

async function getExpiringItems(userId) {
  const today = new Date();
  const upcomingDate = new Date();
  upcomingDate.setDate(today.getDate() + 7);

  const expiringItems = await pantryModel.find({
    user: userId,
    expiryDate: {
      $gte: new Date(today),
      $lte: new Date(upcomingDate),
    },
  });

  return expiringItems
}

module.exports = {getExpiringItems}
