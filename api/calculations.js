const express = require("express");
const router = express.Router();
const coupons = require("../models/admincoupon.model");
const restaurants = require("../models/newrest.model");
const orders = require("../models/orders.model");
const users = require("../models/users.model");
const commissions = require("../models/checkout.model");
const profit_margins = require("../models/plans.model");
const Partners = require('../models/partnerrequest.model')
const postalCodeData = require('../postalCodes.json')

router.route("/restaurants/:country").get(async function (req, res) {
  const { country } = req.params;
  const [inactive, active, unapproved, totalrestaurants] = await Promise.all([
    restaurants.countDocuments({ status: "Inactive" }),
    restaurants.countDocuments({ status: "Active" }),
    restaurants.countDocuments({ status: "Unapproved" }),
    restaurants.countDocuments({ country }),
  ]);
  res.json({ inactive, active, unapproved, totalrestaurants });
});
//get all restaurants


router.route("/users/:country").get(async function (req, res) {
  const { country } = req.params;
  const totalusers = await users.countDocuments({ country });
  const active = await users.countDocuments({ status: "Active" });
  const inactive = await users.countDocuments({ status: "Inactive" });
  res.json({ active, inactive, totalusers });
});
//get all users

router.route("/orders/count-by-country").get(async (req, res) => {
  try {
    const { country } = req.query;
    const filter = { "address.country": country };
    const count = await orders.countDocuments(filter);
    const pendingOrders = await orders.countDocuments({ ...filter, status: "pending" });
    const acceptedOrders = await orders.countDocuments({ ...filter, status: "accepted" });
    const startedOrders = await orders.countDocuments({ ...filter, status: "started" });
    const completedOrders = await orders.countDocuments({ ...filter, status: "completed" });
    const rejectedOrders = await orders.countDocuments({ ...filter, status: "rejected" });
    res.json({
      count, pendingOrders, acceptedOrders, startedOrders, completedOrders, rejectedOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//get all orders

// router.route('/partners/count-by-country').get(async function (req, res) {
//   try {
//     const { country_code } = req.query;

//     // Filter partners by postal codes for the given country and count them
//     const postalCodesForCountry = postalCodeData[country_code] || [];
//     const filter = { postal_code: { $in: postalCodesForCountry }, status: "Pending" };
//     const count = await Partners.countDocuments(filter);
//     res.json({ count });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.route("/revenue").get(async function (req, res) {
  function add(accumulator, a) {
    return parseFloat(accumulator) + parseFloat(a);
  }
  let neworders = await orders.find({
    $or: [
      { status: "completed" },
      { status: "started" },
      { status: "accepted" },
    ],
  });
  let mealrevenue = neworders.map((item) => item.total);
  mealrevenue = mealrevenue.reduce(add, 0); //meal revenue
  let baserevenue = neworders.map((item) => item.base_price);
  baserevenue = baserevenue.reduce(add, 0); //base revenue
  let totaldelivery = neworders.filter((item) => item.delivery_fee !== "N/A")
  totaldelivery = totaldelivery.map((item) => item.delivery_fee);
  totaldelivery = totaldelivery.reduce(add, 0); //Delivery revenue
  let totalservicefee = neworders.map((item) => item.service_fee);
  totalservicefee = totalservicefee.reduce(add, 0); //Service Revenue
  let profits = await profit_margins.find();
  let commission_array = await commissions.find();
  // const { commission } = commission_array[0];
  const commission = 0
  let tips = await neworders.map((item) => item.tip);
  tips = tips.reduce(add, 0); //Tips Revenue
  let taxes = await neworders.map((item) => item.taxes);
  taxes = taxes.reduce(add, 0); //Taxes Revenue
  let discount = await neworders
    .filter((order) => order.promo_id === "PROMOADMIN")
    .map((order) => order.discount);
  discount = discount.reduce(add, 0); //Discounts
  let totalrevenue = parseFloat(
    mealrevenue + totaldelivery + totalservicefee + tips + taxes - discount
  ).toFixed(2);
  let add_ons = await neworders.map((order) => order.add_on);
  add_ons = [].concat.apply([], add_ons);
  add_ons = [].concat.apply([], add_ons);
  let add_on_total = add_ons.map((add_on) => add_on.subtotal);
  add_on_total = add_on_total.reduce(add, 0);
  let add_on_commission = parseFloat((add_on_total * commission) / 100).toFixed(
    2
  );
  let base_commission = parseFloat((baserevenue * commission) / 100).toFixed(2);
  res.json({
    mealrevenue: mealrevenue,
    totaldelivery: totaldelivery,
    totalservicefee: totalservicefee,
    tips: tips,
    baserevenue: baserevenue,
    taxes: taxes,
    discount: discount,
    totalrevenue: totalrevenue,
    add_on_total: add_on_total,
    add_on_commission: add_on_commission,
    base_commission: base_commission,
  });
});
//get all revenue

module.exports = router;
