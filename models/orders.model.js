const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Order = new Schema({
  order_id: { type: String },//auto
  user_name: { type: String },//done
  phone: { type: String }, //done
  email_id: { type: String }, //done
  address: { type: Object }, //done
  card: { type: Object }, //done
  user_id: { type: String }, //done
  start_date: { type: String }, //done
  end_date: { type: String }, //done
  restaurant_id: { type: String }, //done
  restaurant: { type: String }, //done
  restaurant_image: { type: String },
  plan_name: { type: String }, //done
  base_price: { type: String }, //done
  customer_price: String, //done
  tip: { type: String }, //done
  service_fee: { type: String },//done
  delivery_fee: { type: String }, //done
  tax: { type: String }, //done
  taxes: { type: String }, //done
  total: { type: String },//done
  time: { type: String }, //done
  notes: { type: String }, //done
  category: { type: String }, //done
  meal_type: { type: String },//done
  restaurant_address: { type: Object },
  plan: { type: String },
  price: { type: String },
  promo_code: { type: String },
  promo_id: { type: String },
  discount: { type: String },
  meals: { type: Array },
  isDelivery: { type: Boolean },
  order_time: {
    type: String,
  },
  expiry_time: String,
  status: {
    type: String,
    default: "pending",
  },
  add_on: {
    type: Array,
    items: [
      {
        item: { type: String },
        order_date: { type: String },
        rate: { type: String },
        qty: { type: String },
        subtotal: { type: String },
        price: { type: String },
      },
    ],
  },
  color: { type: String }
});

module.exports = mongoose.model("Order", Order);
