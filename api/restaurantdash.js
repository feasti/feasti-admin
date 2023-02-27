const express = require("express");
const router = express.Router();
const { add } = require('../utility/utility')
const Orders = require("../models/orders.model");
const Banner = require("../models/banners.model");
const Users = require("../models/users.model");
const Plan = require("../models/price_plan.model")
const NewRestaurant = require("../models/newrest.model");

// Chef Dashboard Data
router.route("/getusertypesbyrestaurant/:restaurant").get(async (req, res) => {
  const { restaurant } = req.params;
  const myOrders = await Orders.find({ restaurant: restaurant });
  const userids = myOrders.map((item) => item.user_id);
  let uniq = [...new Set(userids)];
  const countOccurrences = (arr, val) =>
    arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
  let x = uniq.map((item) => countOccurrences(userids, item));
  newUse = 0;
  repeat = 0;
  x.forEach((element) => {
    if (element !== 1) {
      repeat += 1;
    } else {
      newUse += 1;
    }
  });
  res.json({
    newusers: uniq.length,
    repeatedUsers: repeat,
    more: x,
  });
});

router.route("/").post(function (req, res) {
  let order = new RestaurantDashboard(req.body);
  order
    .save()
    .then((response) => {
      res.json({ data: response, msg: "Dashboard Created", status: 200 });
    })
    .catch((err) => {
      res.status(400).send("Failed");
    });
});
//create a dashboard

router.route("/:restaurant_name/:id").put(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const response = await RestaurantDashboard.findByIdAndUpdate(id, data);
  res.json(response);
});

router.route("/getchefbyidandupdatebannercount/:id").get(async (req, res) => {
  const response = await Banner.findOne({
    promo_id: req.params.id,
  });
  let { clicks, due, rpc } = response;
  clicks += 1;
  due += parseFloat(rpc);
  const update = await Banner.findByIdAndUpdate(
    { _id: response._id },
    { clicks: clicks, due: due }
  );
  res.json(update);
});

router.route("/getchefbyidandrevenue/:id").get(async (req, res) => {
  const response = await Banner.findOne({
    promo_id: req.params.id,
  });
  const myOrders = await Orders.find({
    $and: [
      { promo_id: req.params.id },
      {
        $or: [
          { status: "accepted" },
          { status: "started" },
          { status: "completed" },
        ],
      },
    ],
  });
  let prices = myOrders.map((item) => item.base_price);
  let revenue = prices.reduce(add, 0);

  let discounts = myOrders.map((item) => item.discount);
  let discount = discounts.reduce(add, 0);

  const userids = myOrders.map((item) => item.user_id);
  let uniq = [...new Set(userids)];

  res.json({
    totalOrders: myOrders.length,
    orders: myOrders,
    banner: response,
    due: response.due,
    clicks: response.clicks,
    discount: discount,
    revenue: revenue,
    users: uniq.length,
  });
});





module.exports = router;