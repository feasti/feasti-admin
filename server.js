const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("./database/database");
// const cookieSession = require("cookie-session");
// End of important imports

// Start of api imports
//const adminLogin = require("./api/admin-login");
const orders = require("./api/orders");
const users = require("./api/users");
const plan = require("./api/plan");
const meals = require("./api/meals")
const cuisine = require("./api/cuisine");
const checkout = require("./api/checkoutoptions");
const banner = require("./api/bannerPlan");
const newrest = require("./api/newrestaurant");
const coupon = require("./api/coupon");
const promo = require("./api/promotions");
const contacts = require("./api/contacts");
const partner = require("./api/partnerrequest");
const slot = require("./api/slots");
const policies = require("./api/policies");
const chefdashboard = require("./api/restaurantdash");
const review = require("./api/reviews");
const currentOrders = require("./api/currentorder");
const payout = require("./api/admintochefpayments");
const payoutcycle = require("./api/payoutcycle");
const stripeintent = require("./api/stripe");
const admincoupon = require("./api/admin-coupon");
const calculations = require("./api/calculations");
const driver = require("./api/driver");
const priceplans = require("./api/price_plans")
// End of API imports

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
app.use(express.json())
app.use(cors());
app.use("/api/users", users);
app.use("/api/newrest", newrest);
app.use("/api/orders", orders);
app.use("/api/meals", meals)
app.use("/api/plans", plan);
app.use("/api/cuisine", cuisine);
app.use("/api/checkout", checkout);
app.use("/api/getcurrentorder", currentOrders);
app.use("/api/banner", banner);
app.use("/api/coupon", coupon);
app.use("/api/promo/", promo);
app.use("/api/policies", policies);
app.use("/api/chefdashboard", chefdashboard);
app.use("/api/partnerrequest", partner);
app.use("/api/slots", slot);
app.use("/api/contacts", contacts);
app.use("/api/admintochefpayments", payout);
app.use("/api/payoutcycle", payoutcycle);
app.use("/api/review", review);
app.use("/api/stripe", stripeintent);
//app.use("/api/admin-login", adminLogin);
app.use("/api/admin-coupon", admincoupon);
app.use("/api/calculations", calculations);
app.use("/api/driver", driver);
app.use("/api/pricing", priceplans)
// app.use(
//   cookieSession({
//     secret: "mysecret",
//   })
// );

app.use(express.static(path.join(__dirname, "./build/")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./build/"));
  res.setHeader('Access-Control-Allow-Origin', "*")
  res.setHeader('Access-Control-Allow-Headers', "application/json")
});

app.listen(port, () => {
  console.warn(`Server started on port ${port}`);
});
