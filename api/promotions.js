const express = require("express");
const router = express.Router();
const Promo = require("../models/banners.model");
const Restaurants = require("../models/newrest.model");
const Orders = require('../models/orders.model')

router.route("/").get(async (req, res) => {
  const banner = await Promo.find();
  res.json({ status: 200, data: banner, msg: "Plans Fetched" });
});
//get all banners

router.route("/active").get(async (req, res) => {
  let allRestaurants = await Restaurants.find();
  let allBanners = await Promo.find({ status: "active" });
  let promoted_restaurants = [];
  for (let i = 0; i < allRestaurants.length; i++) {
    for (let j = 0; j < allBanners.length; j++) {
      if (allBanners[j].restaurant_id === allRestaurants[i].restaurant_id) {
        let abc = {};
        abc["restaurant"] = allRestaurants[i];
        abc["banner"] = allBanners[j];
        promoted_restaurants.push(abc);
      }
    }
  }
  res.json(promoted_restaurants);
});
//get banners for users

router.route("/:restaurant_id/:status").get(async (req, res) => {
  const { restaurant_id, status } = req.params
  const myCoupons = await Promo.find({ restaurant_id: restaurant_id, status: status });
  const myOrders = await Orders.find({
    $and: [{ restaurant_id: restaurant_id }, {
      $or: [{ status: "accepted" },
      { status: "started" },
      { status: "completed" }
      ]
    }]

  });
  let promoted_orders = [];
  let revenue = 0;
  let discount = 0;
  for (let i = 0; i < myCoupons.length; i++) {
    for (let j = 0; j < myOrders.length; j++) {
      if (myCoupons[i].promo_code === myOrders[j].promo_code) {
        promoted_orders.push(myOrders[j]);
      }
    }
    revenue = promoted_orders.length !== 0 ? (parseFloat(promoted_orders[i].base_price) * parseFloat(promoted_orders.length)) : 0
    discount = promoted_orders.length !== 0 ? (
      parseFloat(promoted_orders[i].discount) *
      parseFloat(promoted_orders.length)
    ) : 0
  }
  const userids = promoted_orders.map((item) => item.user_id);
  let uniq = [...new Set(userids)];
  res.json({
    coupons: myCoupons,
    promotedOrders: promoted_orders,
    total_order: promoted_orders.length,
    revenue: revenue,
    total_base_income: revenue,
    total_net_income: revenue - discount,
    unique: uniq,
    unique_users: uniq.length,
    discount: discount,
  });
});

router.route("/getchefbyidandupdatebannercount/:promo_id/:id").get(async (req, res) => {
  const { promo_id, id } = req.params
  const response = await Promo.findOne({ promo_id: promo_id });
  let { clicks, due, rpc } = response;
  clicks += 1;
  due += parseFloat(rpc);
  const update = await Promo.findByIdAndUpdate({ _id: id },
    { clicks: clicks, due: due }
  );
  res.json(update);
});
// 

router.route("/getbannerslength/:restaurant_id").get(async (req, res) => {
  const banner = await Promo.find({
    restaurant_id: req.params.restaurant_id,
    status: "active",
  });
  res.json(banner);
});

router.route("/").post(async (req, res) => {
  const newBanner = new Promo(req.body);
  const banner = await newBanner.save();
  res.json({ status: 200, data: banner, msg: "New Plan Added" });
});
//save a banner

router.route("/getbannerdetails/:id").get(async (req, res) => {
  let { id } = req.params;
  const banner = await Promo.findById(id);
  res.json({ status: 200, data: banner, msg: "Promo Plan Fetched" });
});
//get specific banner

router.route("/:id").put(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const banner = await Promo.findByIdAndUpdate(id, data);
  res.json({ status: 200, data: banner, msg: "Plan Updated" });
});
//update a banner

router.route("/:id").delete(async (req, res) => {
  const { id } = req.params;
  const banner = await Promo.findByIdAndDelete(id);
  res.json({ status: 200, data: banner, msg: "Plan Deleted" });
});
//delete a banner

router.route("/").delete(async (req, res) => {
  const response = await Promo.deleteMany({});
  res.json({ status: 200, data: response.data, msg: "All Deleted" });
});
// Delete all

module.exports = router;
