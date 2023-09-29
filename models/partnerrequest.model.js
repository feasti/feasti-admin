const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Partner = new Schema({
  first_name: String,
  last_name: String,
  postal_code: String,
  phone: String,
  email: String,
  restaurant_name: String,
  status: {
    type: String,
    default: "Pending",
  },
  created_at: {
    type: Date,
    default: Date.now()
  },
});

module.exports = mongoose.model("Partner", Partner);
