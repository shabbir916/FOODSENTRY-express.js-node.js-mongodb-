const pantryModel = require("../models/pantry.model");

function expiryDateRange(){
  const today = new Date();
  today.setHours(0,0,0,0);

  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);
  next7Days.setHours(23,59,59,999);

  return {today,next7Days};
}

async function getExpiringItems(userId) {
  const {today,next7Days} = expiryDateRange();

  const expiringItems = await pantryModel.find({
    user: userId,
    expiryDate: { $gte: today, $lte: next7Days },
  });

  return expiringItems;
}

module.exports = { getExpiringItems,expiryDateRange };
