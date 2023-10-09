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
const { add } = require('../utility/utility')

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


// router.route("/users/:country").get(async function (req, res) {
//   const { country } = req.params;
//   const totalusers = await users.countDocuments({ country });
//   const active = await users.countDocuments({ status: "Active" });
//   const inactive = await users.countDocuments({ status: "Inactive" });
//   res.json({ active, inactive, totalusers });
// });
//get all users

router.route("/users/count-by-country").get(async function (req, res) {
  const { country } = req.query;
  const countries = ["United States", "Canada"];
  const data = [];
  for (let indx = 0; indx < countries.length; indx++) {
    const cnt = countries[indx];
    const ab = {};
    const filter = { "addresses.0.country": cnt };
    const usr = await users.countDocuments({ $and: [filter, { status: "Active" }] });
    ab.country = cnt;
    ab.usersCount = usr;
    data.push(ab);
  }
  const usrUnkn = await users.countDocuments({ "addresses.0.country": { $exists: false } });
  data.push({ country: "N/A", usersCount: usrUnkn })
  res.json(data);
});

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

router.route("/revenue").get(async function (req, res) {
  try {
    const countries = ["United States", "Canada"];
    const revenueByCountry = {};

    for (let indx = 0; indx < countries.length; indx++) {
      const cnt = countries[indx];
      const filter = { "address.country": cnt };

      const newOrders = await orders.find({
        status: { $in: ["completed", "started", "accepted"] },
        ...filter, // Apply the country filter here
      });

      const mealRevenue = newOrders.reduce((total, item) => total + parseFloat(item.total), 0).toFixed(2);
      const baseRevenue = newOrders.reduce((total, item) => total + parseFloat(item.base_price), 0).toFixed(2);
      const totalDelivery = newOrders
        .filter((item) => item.delivery_fee !== "N/A")
        .reduce((total, item) => total + parseFloat(item.delivery_fee), 0).toFixed(2);
      const totalServiceFee = newOrders.reduce((total, item) => total + parseFloat(item.service_fee), 0).toFixed(2);
      const commission = 0;
      const tips = newOrders.reduce((total, item) => total + parseFloat(item.tip), 0).toFixed(2);
      const taxes = newOrders.reduce((total, item) => total + parseFloat(item.tax), 0).toFixed(2);
      const discount = newOrders
        .filter((order) => order.promo_id === "PROMOADMIN")
        .reduce((total, order) => total + parseFloat(order.discount), 0).toFixed(2);
      const totalRevenue = (parseFloat(mealRevenue) + parseFloat(totalDelivery) + parseFloat(totalServiceFee) + parseFloat(tips) + parseFloat(taxes) - parseFloat(discount)).toFixed(2);
      const addOns = newOrders.flatMap((order) => order.add_on).flatMap((addOn) => addOn.subtotal);
      const addOnTotal = addOns.reduce(add, 0);
      const addOnCommission = ((addOnTotal * commission) / 100).toFixed(2);
      const baseCommission = ((baseRevenue * commission) / 100).toFixed(2);

      // Store the revenue data by country
      revenueByCountry[cnt] = {
        mealRevenue,
        totalDelivery,
        totalServiceFee,
        tips,
        baseRevenue,
        taxes,
        discount,
        totalRevenue,
        addOnTotal,
        addOnCommission,
        baseCommission,
      };
    }

    res.json(revenueByCountry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get all revenue

module.exports = router;
