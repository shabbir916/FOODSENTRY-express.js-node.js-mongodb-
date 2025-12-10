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
  opened: {
    type: Boolean,
    default: false,
  },
  openedOn: {
    type: Date,
    default: null,
  },
  useWithinDays: 
  { type: Number, 
    default: null 
  },
  emailNotified: {
    type: Boolean,
    default: false,
  },
  emailNotifiedOpenExpiry: {
    type: Boolean,
    default: false,
  },
});

const pantyrModel = mongoose.model("pantries", pantrySchema);

module.exports = pantyrModel;
