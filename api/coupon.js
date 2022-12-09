const express = require("express");
const router = express.Router();
const Coupon = require("../models/coupons.model");
const Orders = require("../models/orders.model");

router.route("/").get(async function (req, res) {
  const response = await Coupon.find({})
  res.json(response)
});
//get all coupons

router.route("/:id").get(function (req, res) {
  let id = req.params.id;
  Coupon.findById({ _id: id }, function (err, coupon) {
    if (!err) {
      res.json(coupon);
    }
  });
});
//get specific coupon

router.route("/").post(async function (req, res) {
  const count = await Coupon.count()
  let coupon = new Coupon(req.body);
  const { isAdmin } = coupon
  const promoId = isAdmin ? "PROMOADMIN" : "PROMO".concat(count.toString().padStart(4, "0"))
  coupon.promo_id = promoId
  const response = await coupon.save()
  res.json({ status: 200, data: response, msg: "Done" });
});
//save a singe coupon to database

router.route("/getcouponforchef/:restaurant_id/:status").get(async (req, res) => {
  const { status, restaurant_id } = req.params
  const myCoupons = await Coupon.find({
    $and: [{ restaurant_id: restaurant_id }, { status: status }]
  });
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

router.route("/getpromotedorders/:restaurant_id").get(async (req, res) => {
  const myPromotedOrders = await Orders.find({
    restaurant_id: req.params.restaurant_id,
  });
  res.json({
    used_by: myPromotedOrders.length,
    promotedOrders: myPromotedOrders,
  });
});
//get all promo

router.route("/:id").put(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const response = await Coupon.findByIdAndUpdate(id, data);
  res.json(response);
});




router.route("/:id").delete((req, res, next) => {
  Coupon.findByIdAndDelete(req.params.id, (err, data) => {
    if (err) {
      res.status(200).json({ data: err });
    } else {
      res.json({ status: 200, data: data });
    }
  });
});
//delete a coupon

router.route("/").delete((req, res, next) => {
  Coupon.deleteMany({}, (err, resp) => {
    res.json({ msg: "All Deleted" });
  });
});
//delete all users
module.exports = router;
