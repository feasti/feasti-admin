const express = require("express");
const router = express.Router();
const { add } = require('../utility/utility')
const Orders = require("../models/orders.model");
const Banner = require("../models/banners.model");


// Chef Dashboard Data
router.route("/getUniqueUserTypesByRestaurant/:restaurant").get(async (req, res) => {
  const { restaurant } = req.params;
  const myOrders = await Orders.find({ restaurant });
  const userIds = myOrders.map((item) => item.user_id);
  const uniqueUserIds = [...new Set(userIds)];
  const userOccurrences = uniqueUserIds.map((item) => userIds.filter(id => id === item).length);
  const newUsers = userOccurrences.filter(element => element === 1).length;
  const repeatedUsers = userOccurrences.length - newUsers;
  res.json({
    newUsers: uniqueUserIds.length,
    repeatedUsers: repeatedUsers,
    userOccurrences: userOccurrences,
  });
});


router.route("/").post(async (req, res) => {
  try {
    const order = new RestaurantDashboard(req.body);
    const response = await order.save();
    res.json({ data: response, msg: "Dashboard Created", status: 200 });
  } catch (err) {
    res.status(400).send("Failed");
  }
});
//create a dashboard

router.route("/:restaurant_name/:id").put(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const response = await RestaurantDashboard.findByIdAndUpdate(id, data);
  res.json(response);
});

router.route("/getchefbyidandupdatebannercount/:id").get(async (req, res) => {
  const { id } = req.params;
  const response = await Banner.findOneAndUpdate(
    { promo_id: id },
    { $inc: { clicks: 1 }, $inc: { due: parseFloat(rpc) } },
    { new: true }
  );
  res.json(response);
});

router.route("/getchefbyidandrevenue/:id").get(async (req, res) => {
  const { id } = req.params;
  const response = await Banner.findOne({ promo_id: id });
  const myOrders = await Orders.find({
    promo_id: id,
    status: { $in: ["accepted", "started", "completed"] },
  });

  const { base_price, discount, user_id } = myOrders.reduce((acc, curr) => {
    acc.base_price.push(curr.base_price);
    acc.discount.push(curr.discount);
    acc.user_id.add(curr.user_id);
    return acc;
  }, { base_price: [], discount: [], user_id: new Set() });

  const totalOrders = myOrders.length;
  const revenue = base_price.reduce((acc, curr) => acc + curr, 0);
  const totalDiscount = discount.reduce((acc, curr) => acc + curr, 0);
  const uniqueUsers = user_id.size;

  res.json({
    totalOrders,
    orders: myOrders,
    banner: response,
    due: response.due,
    clicks: response.clicks,
    discount: totalDiscount,
    revenue,
    users: uniqueUsers,
  });
});

module.exports = router;
