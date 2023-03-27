const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("./database/database");
// const cookieSession = require("cookie-session");
// End of important imports

// Start of api imports
const admincoupon = require("./api/admin-coupon");
//const adminLogin = require("./api/admin-login");
const payout = require("./api/admintochefpayments");
const banner = require("./api/bannerPlan");
const calculations = require("./api/calculations");
const checkout = require("./api/checkoutoptions");
const contacts = require("./api/contacts");
const coupon = require("./api/coupon");
const cuisine = require("./api/cuisine");
const currentOrders = require("./api/currentorder");
const meals = require("./api/meals")
const newrest = require("./api/newrestaurant");
const orders = require("./api/orders");
const partner = require("./api/partnerrequest");
const payoutcycle = require("./api/payoutcycle");
const plan = require("./api/plan");
const policies = require("./api/policies");
const priceplans = require("./api/price_plans")
const promo = require('./api/promotions')
const review = require("./api/reviews");
const slot = require("./api/slots");
const stripeintent = require("./api/stripe");
const users = require("./api/users");
const updater = require("./api/updater")
// End of API imports

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json())
app.use(cors());

// Start Using APIs
app.use("/api/admin-coupon", admincoupon);
//app.use("/api/admin-login", adminLogin);
app.use("/api/admintochefpayments", payout);
app.use("/api/banner", banner);
app.use("/api/calculations", calculations);
app.use("/api/checkout", checkout);
app.use("/api/contacts", contacts);
app.use("/api/coupon", coupon);
app.use("/api/cuisine", cuisine);
app.use("/api/getcurrentorder", currentOrders);
app.use("/api/meals", meals)
app.use("/api/newrest", newrest);
app.use("/api/orders", orders);
app.use("/api/partnerrequest", partner);
app.use("/api/payoutcycle", payoutcycle);
app.use("/api/plans", plan);
app.use("/api/policies", policies);
app.use("/api/pricing", priceplans)
app.use("/api/promo", promo)
app.use("/api/review", review);
app.use("/api/slots", slot);
app.use("/api/stripe", stripeintent);
app.use("/api/users", users);
//End of Using API

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
updater.start()
