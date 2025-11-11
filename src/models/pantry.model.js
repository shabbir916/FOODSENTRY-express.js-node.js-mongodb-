const mongoose = require("mongoose");

const pantrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  quantity: {
    type: String,
  },
  expiryDate: {
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const pantyrModel = mongoose.model("pantries",pantrySchema);

module.exports = pantyrModel
