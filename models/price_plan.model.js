const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let PricePlans = new Schema({
    restaurant_id: { type: String },
    isDelivery: Boolean,
    price_plans: {
        type: Array,
        category: String,
        plans: [
            {
                plan_name: String,
                base_price: String,
                profit_margin: String,
                customer_price: String,
                delivery_price: String,
                activeDays: Array
            }
        ]
    }
});

module.exports = mongoose.model("PricePlans", PricePlans);
