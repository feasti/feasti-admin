const express = require("express");
const moment = require("moment");
const router = express.Router();
const Order = require("../models/orders.model");
const NewRestaurant = require("../models/newrest.model");
const CurrentOrder = require("../models/currentorders.model")
const Meals = require("../models/meals.model")
const pdfTemplate = require("../receipt");
const pusher = require('../utility/messaging')
// const pdf = require("html-pdf");
const { add, sendOrderNotificationToChef } = require('../utility/utility')
const twilio = require('twilio')
const client = new twilio(process.env.ACC_SID_TWIL, process.env.AUTH_TOKEN_TWIL)

// router.route("/create-pdf/").post(async (req, res) => {
//   pdf
//     .create(pdfTemplate(req.body), {})
//     .toFile(`${__dirname}/receipt.pdf`, (err) => {
//       if (err) {
//         console.log(err);
//       }
//       res.send(Promise.resolve());
//     });
// });

// router.route("/fetch-pdf").get(async (req, res) => {
//   await res.sendFile(`${__dirname}/receipt.pdf`);
// });

router.route("/").get(function (req, res) {
  Order.find(function (err, order) {
    if (!err) {
      res.json(order);
    }
  });
});
//get all orders

router.route("/:id").get(async function (req, res) {
  const { id } = req.params;
  const order = await Order.findById(id)
  res.json(order)
});
//get specific order

router.route("/getOrderbyID/:id").get(async function (req, res) {
  const { id } = req.params;
  const order = await Order.findOne({ order_id: id })
  res.json(order)
});
//get specific order

router.route("/rejected/:restaurant_id").get(async (req, res) => {
  const rejectedorders = await Order.find({
    $and: [{ status: "rejected" }, { restaurant_id: req.params.restaurant_id }],
  });
  res.json({ rejectedorders: rejectedorders, count: rejectedorders.length });
});
//get rejected orders

router.route("/pending/:restaurant_id").get(async (req, res) => {
  const orders = await Order.find({
    $and: [{ status: "pending", restaurant_id: req.params.restaurant_id }],
  });
  res.json({ pendingorders: orders, count: orders.length });
});
//get pending orders

router.route("/accepted/:restaurant_id").get(async (req, res) => {
  const activeorders = await Order.find({
    $and: [{ status: "accepted" }, { restaurant_id: req.params.restaurant_id }],
  });
  res.json({ activeorders: activeorders, count: activeorders.length });
});
//get active orders

router.route("/active/:restaurant_id").get(async (req, res) => {
  const activeorders = await Order.find({
    $and: [{ status: "started" }, { restaurant_id: req.params.restaurant_id }],
  });
  res.json({ activeorders: activeorders, count: activeorders.length });
});
//get active orders

router.route("/completed/:restaurant_id").get(async (req, res) => {
  const completedorders = await Order.find({
    $and: [
      { status: "completed" },
      { restaurant_id: req.params.restaurant_id },
    ],
  });
  res.json({ completedorders: completedorders, count: completedorders.length });
});
//get completed orders

router.route("/cancelled/:restaurant_id").get(async (req, res) => {
  const cancelled = await Order.find({
    $and: [
      { status: "cancelled" },
      { restaurant_id: req.params.restaurant_id },
    ],
  });
  res.json({ cancelled: cancelled, count: cancelled.length });
});
//get cancelled orders

router.route("/forchefhome/:restaurant_id/:day/:category").get(async (req, res) => {
  const { restaurant_id, day, category } = req.params
  let activeorders = await Order.find({
    restaurant_id: restaurant_id,
    category: category,
    $or: [{ status: "accepted" }, { status: "started" }]
  });
  let orderedAdOns = [].concat.apply(
    [],
    activeorders.flatMap((item) => item.add_on)
  );
  let { meals } = await Meals.findOne({ restaurant_id: restaurant_id })
  meals = meals.find((meal) => meal.category === category).items
  let mealName = "";
  let mealType = "";
  let count = 0;
  let add_on_name = [];
  let todayAdOns = []
  if (day === "Today") {
    const today = moment();
    activeorders = activeorders.filter((item) =>
      today.isBetween(item.start_date, moment(item.end_date).add(1, "day"))
    );
    todayAdOns = orderedAdOns.filter((extra) => extra.order_date === today.format('DD-MMM-YYYY'))
    const { meal_name, type, add_on } = meals.find((meal) => meal.day === today.format('dddd'))
    mealName = meal_name
    mealType = type
    count = activeorders.length;
    add_on_name = Array.isArray(add_on) && add_on.length !== 0 ? add_on.map((data) => data.add_on) : [];
  } else if (day === "Tomorrow") {
    const today = moment().add(1, "days");
    activeorders = activeorders.filter((item) =>
      today.isBetween(item.start_date, moment(item.end_date).add(1, "day"))
    );
    const { meal_name, type, add_on } = meals.find((meal) => meal.day === today.format('dddd'))
    count = activeorders.length;
    mealName = meal_name;
    mealType = type;
    add_on_name = Array.isArray(add_on) && add_on.length !== 0 ? add_on.map((data) => data.add_on) : [];
  } else {
    const today = moment().add(2, "days");
    activeorders = activeorders.filter((item) =>
      today.isBetween(item.start_date, moment(item.end_date).add(1, "day"))
    );
    const { meal_name, type, add_on } = meals.find((meal) => meal.day === today.format('dddd'))
    count = activeorders.length;
    mealName = meal_name;
    mealType = type;
    add_on_name = Array.isArray(add_on) && add_on.length !== 0 ? add_on.map((data) => data.add_on) : [];
  }
  res.json({
    count: count,
    orderedAdOns: todayAdOns,
    meal_name: mealName,
    add_ons: add_on_name,
    type: mealType,
  });
});
//get active orders

router.route("/:id").delete(async (req, res) => {
  const response = await Order.findByIdAndDelete(req.params.id);
  if (response !== null) {
    res.json({ status: 200, msg: "Deleted", data: response });
  }
});
//delete single order

router.route("/").post(async function (req, res) {
  const { orderToPlace } = req.body
  let count = await Order.count()
  count = count + 1
  const orderId = "ORDER".concat(count.toString().padStart(4, "0"))
  const order = new Order({ ...orderToPlace, order_id: orderId })
  const { phone, restaurant_address } = order
  await client.messages.create(
    {
      to: phone,
      from: process.env.TWIL_NUMBER,
      body: 'Dear Customer, Feasti received your order! Currently processing it and will notify you upon acceptance by our kitchen partner. Thanks for choosing Feasti!'
    });
  await client.messages.create({
    to: restaurant_address.phone,
    from: process.env.TWIL_NUMBER,
    body: 'New order from Feasti received. Respond within 45 mins to accept or reject.'
  })
  pusher.trigger("my-channel", "my-event", {
    message: `New Order ${orderId} Placed from ${orderToPlace.user_id} to ${orderToPlace.restaurant_id}`
  })
  const response = await order.save()
  await sendOrderNotificationToChef(orderToPlace.chefToken, orderId, orderToPlace.user_name)
  res.json({ data: response, phone, msg: "Order Placed!", status: 200 });
});
//save a order

router.route("/checkExistingOrder/:user_id").post(async function (req, res) {
  const { user_id } = req.params
  const existingOrders = await Order.find({ user_id })
  if (existingOrders.length > 0) {
    res.json({ isOldUser: true })
  }
})

router.route("/getorderbyuser/:id").get(async function (req, res) {
  let { id } = req.params;
  const orders = await Order.find({ user_id: id });
  const restaurants = await NewRestaurant.find()
  let myOrders = []
  orders.map(async (order) => {
    restaurants.filter((restaurant) => {
      if (restaurant.restaurant_id === order.restaurant_id) {
        order.restaurant_image = restaurant.documents[0].restaurant_image
      }
    })
    order.color = order.status === "accepted" ? "#ffc300" :
      order.status === "started" ? "#f5a617" :
        order.status === "pending" ? "#aaa" :
          order.status === "rejected" ? "#777" : "#22cf6c"
    myOrders.push(order)
  })
  res.json({ myOrders: myOrders, totalCount: myOrders.length });
});
//get all order by user

router.route("/getsubscription/:id").get(async function (req, res) {
  let { id } = req.params;
  const orders = await Order.find({ user_id: id, status: "started" });
  let myOrders = []
  orders.forEach((order) => {
    async function populate(item) {
      const { restaurant_id, category } = item
      const restaurant = await NewRestaurant.findOne({ restaurant_id: restaurant_id })
      const { documents } = restaurant
      const { meals } = await Meals.findOne({ restaurant_id: restaurant_id })
      const { items } = meals.find((o) => o.category === category)
      item.meals = items
      item.restaurant_image = documents[0].restaurant_image
      myOrders.push(item)
    }
    populate(order)
  })
  setTimeout(() => {
    res.json({ mySubscription: myOrders, totalCount: myOrders.length });
  }, 10000)
});
//get all subscription by user

router.route("/getSubscriptionDetails/:id").get(async function (req, res) {
  let { id } = req.params;
  const order = await Order.findOne({ order_id: id, status: "started" });
  res.json({ mySubscription: order, remaining: 0, add_ons: [], futuremeals: [], delivered: false });
});
//get all subscription by user

router.route("/dashboard/:restaurant_id").get(async (req, res) => {
  let restaurant_id = req.params.restaurant_id;
  const response = await Order.find({
    $and: [
      { restaurant_id: restaurant_id },
      {
        $or: [
          { status: "started" },
          { status: "accepted" },
          { status: "cancelled" },
          { status: "completed" },
        ],
      },
    ],
  });

  const twoOrders = await response.filter((item) => item.plan === "twoPlan");
  const fifteenOrders = await response.filter(
    (item) => item.plan === "fifteenPlan"
  );
  function add(accumulator, a) {
    return parseFloat(accumulator) + parseFloat(a);
  }
  const thirtyOrders = await response.filter(
    (item) => item.plan === "thirtyPlan"
  );
  const sumTwo = twoOrders.map((item) => item.base_price).reduce(add, 0);
  const discountTwo = twoOrders
    .filter((item) => item.promo_id !== "PROMOADMIN")
    .map((item) => item.discount)
    .reduce(add, 0);
  const sumFifteen = fifteenOrders
    .map((item) => item.base_price)
    .reduce(add, 0);
  const discountFifteen = fifteenOrders
    .filter((item) => item.promo_id !== "PROMOADMIN")
    .map((item) => item.discount)
    .reduce(add, 0);
  const sumThirty = thirtyOrders
    .filter((item) => item.promo_id !== "PROMOADMIN")
    .map((item) => item.base_price)
    .reduce(add, 0);
  const discountThirty = thirtyOrders
    .map((item) => item.discount)
    .reduce(add, 0);
  let totalDiscount = discountTwo + discountFifteen + discountThirty;
  let totalRevenue = sumTwo + sumFifteen + sumThirty;
  let grossRevenue = totalRevenue - totalDiscount;
  res.json({
    sumTwo: sumTwo,
    discountTwo: discountTwo,
    sumFifteen: sumFifteen,
    discountThirty: discountThirty,
    discountFifteen: discountFifteen,
    sumThirty: sumThirty,
    totalRevenue: totalRevenue,
    totalDiscount: totalDiscount,
    grossRevenue: grossRevenue,
    countTwoMeals: twoOrders.length,
    countFifteenMeals: fifteenOrders.length,
    countThirtyMeals: thirtyOrders.length,
  });
});
router.put("/changestatus/:id", async function (req, res, next) {
  const { id } = req.params
  const { status } = req.body
  const response = await Order.findByIdAndUpdate(id, { status })
  const updateorder = await Order.findById(id)
  await client.messages.create(
    {
      to: updateorder.phone,
      from: process.env.TWIL_NUMBER,
      body: `${status === 'accepted' ? "A new order from Feasti has been received. Please reply within 45 minutes to confirm or decline. If there's no response from the chef, the order will be automatically rejected after the time expires."
        : "Our kitchen partner couldn't accept your order. Explore other options or contact us. Thank you!"}`
    });
  res.json({
    status: 201,
    data: updateorder,
    msg: "Status updated successfully"
  })
});
//update an order

router.put("/:id", async function (req, res, next) {
  const { id } = req.params
  const { add_on } = await Order.findById(id)
  let add_ons = [...add_on]
  add_ons.push(...req.body)
  const response = await Order.findByIdAndUpdate(id, { add_on: add_ons })
  const updateorder = await Order.findById(id)
  res.json({
    status: 201,
    data: updateorder,
    msg: "Add-On ordered successfully"
  })
});
//update an order

router.route("/").delete((req, res, next) => {
  Order.deleteMany({}, (err, resp) => {
    res.json({ msg: "All Deleted" });
  });
});
//delete all

module.exports = router;
