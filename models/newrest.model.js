const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let NewRestaurant = new Schema({
  restaurant_id: { type: String },
  about: { type: String },
  pin: { type: String },
  account_name: { type: String },
  account_number: { type: String },
  bank_name: { type: String },
  branch_number: { type: String },
  institution_number: { type: String },
  locality: { type: String },
  city: { type: String },
  states: { type: String },
  country: { type: String },
  postal_code: { type: String },
  commission: { type: String },
  cuisine_type: { type: String },
  banner_image: String,
  profile_picture: String,
  documents: {
    type: Array,
    items: [
      {
        image: { type: String },
        image_name: { type: String },
      },
    ],
  },
  papers: [
    {
      image: { type: String },
      image_name: { type: String },
    },
  ],
  email: { type: String },
  owner_name: { type: String },
  phone: { type: String },
  restaurant_name: { type: String },
  status: { type: String, default: "Unapproved" },
  meals: {
    type: Array,
    items: [
      {
        description: { type: String },
        image: { type: String },
        meal_name: { type: String },
        slot: { type: String },
        day: { type: String },
        type: { type: String },
        add_on: {
          type: Array,
          items: [
            {
              add_on: { type: String },
              add_on_price: { type: String },
              add_on_image: { type: String },
            },
          ],
        },
      },
    ],
  },
  promo: [
    {
      promo_id: String,
      promo_code: String,
      plan_name: String,
      discount: String,
      discount_type: String,
      status: String,
    },
  ],
  advert_id: { type: String },
  category: { type: String },
  meal_type: { type: String },
  rating: { type: String },
  reviews: [
    {
      user_name: { type: String },
      reviews: { type: String },
    },
  ],
  isDelivery: Boolean,
  taxes: { type: String },
  price_plans: Array,
  sharecode: String
});

module.exports = mongoose.model("NewRestaurant", NewRestaurant);
