const express = require("express");
const { add } = require('../utility/utility')
const router = express.Router();
const NewRestaurant = require("../models/newrest.model");
const Meals = require('../models/meals.model')
const Orders = require("../models/orders.model");
const Price = require("../models/price_plan.model")
const Coupon = require('../models/coupons.model')
const Banner = require("../models/banners.model")
const RestaurantDashboard = require('../models/restaurant_dashboard.model')



router.route("/").get(async function (req, res) {
  const response = await NewRestaurant.find({})
  const meals = await Meals.find({})
  let restaurants = []
  response.forEach((restaurant) => {
    meals.filter((meal) => {
      if (restaurant.restaurant_id === meal.restaurant_id) {
        restaurant.meals = meal.meals
        restaurants.push(restaurant)
      }
    })
  })
  res.json(restaurants)
});
// get all restaurant for admin

router.route("/active").get(async function (req, res) {
  const response = await NewRestaurant.find({ status: "Active" })
  let restaurants = []
  response.forEach(async (restaurant) => {
    const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id })
    const { items } = meals.find(meal => meal.category === 'Lunch')
    const { isDelivery, price_plans } = await Price.findOne({ restaurant_id: restaurant.restaurant_id })
    const { plans } = price_plans.find((plan) => plan.category === 'Lunch')
    const promo = await Coupon.findOne({ $and: [{ restaurant_id: restaurant.restaurant_id }, { status: "Active" }] })
    restaurant.meals = items
    restaurant.price_plans = plans
    restaurant.isDelivery = isDelivery
    restaurant.promo = promo
    restaurants.push(restaurant)
  })
  setTimeout(() => {
    res.json(restaurants);
  }, 8000)
});
//get active restaurants for user

router.route("/login").post(async (req, res) => {
  let restaurant = await NewRestaurant.findOne({ $and: [{ phone: req.body.phone }, { $ne: { status: 'unapproved' } }] }).exec();
  const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id })
  const { price_plans, isDelivery } = await Price.findOne({ restaurant_id: restaurant.restaurant_id })
  const coupon = await Coupon.findOne({ restaurant_id: restaurant.restaurant_id, status: "Active" })
  restaurant.meals = meals
  restaurant.isDelivery = isDelivery
  restaurant.price_plans = price_plans
  restaurant.promo = coupon
  if (restaurant) {
    res.json({ status: 200, data: restaurant });
  } else {
    res.json({ status: 404 });
  }
});
//restaurant login

router.route("/:id").delete(async (req, res, next) => {
  const { id } = req.params
  await NewRestaurant.findByIdAndDelete(id)
  res.json({
    status: 200,
    msg: "Deleted"
  })
});
//delete a restaurant

router.route("/").post(async function (req, res) {
  const count = await NewRestaurant.count()
  const restId = "REST".concat((count + 1).toString().padStart(4, "0"))
  let restaurant = new NewRestaurant({ ...req.body, restaurant_id: restId });
  let meals = new Meals({ restaurant_id: restId, meals: [{ category: "Lunch", items: [] }, { category: "Dinner", items: [] }] })
  const saveMeals = await meals.save()
  let price = new Price({
    restaurant_id: restId,
    isDelivery: false,
    price_plans: [{ category: "Lunch", plans: [] }, { category: "Dinner", plans: [] }]
  })
  const savePrice = await price.save()
  const response = await restaurant.save()
  res.json({
    data: response,
    status: 200,
    msg: "Restaurant Added Successfully",
  })
});
//save a restaurant

router.route("/:id").put(async function (req, res, next) {
  const restaurant = await NewRestaurant.findByIdAndUpdate(req.params.id, req.body)
  res.json(restaurant)
});
//update a restaurant

router.route("/:id").get(async function (req, res) {
  let { id } = req.params;
  const restaurant = await NewRestaurant.findById(id)
  const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id })
  const { price_plans, isDelivery } = await Price.findOne({ restaurant_id: restaurant.restaurant_id })
  restaurant.meals = meals
  restaurant.isDelivery = isDelivery
  restaurant.price_plans = price_plans
  res.json(restaurant)
});
//get specific restaurant

router.route("/getchefbyId/:id").get(async (req, res) => {
  const { id } = req.params
  const response = await NewRestaurant.findOne({ restaurant_id: id })
  const { meals } = await Meals.findOne({ restaurant_id: id })
  const { items } = meals.find((meal) => meal.category === "Lunch")
  const { price_plans, isDelivery } = await Price.findOne({ restaurant_id: id })
  const { plans } = price_plans.find((price_plan) => price_plan.category === "Lunch")
  const { promo_code, discount_type, discount, meal_plan } = await Banner.findOne({ restaurant_id: id })
  const coupon = {
    promo_code,
    discount_type,
    discount,
    isDelivery: false,
    plan_name: meal_plan
  }
  response.isDelivery = isDelivery
  response.meals = items
  response.price_plans = plans
  response.promo.push(coupon)
  res.json(response);
});
//get specific restaurant by chef ID

router.route("/cuisine_type/:cuisine").get(async function (req, res) {
  const { cuisine } = req.params;
  const response = await NewRestaurant.find({ $and: [{ status: "Active" }, { cuisine_type: cuisine }] })
  let restaurants = []
  response.forEach(async (restaurant) => {
    const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id })
    const { items } = meals.find(meal => meal.category === 'Lunch')
    const { isDelivery, price_plans } = await Price.findOne({ restaurant_id: restaurant.restaurant_id })
    const { plans } = price_plans.find((plan) => plan.category === 'Lunch')
    restaurant.meals = items
    restaurant.price_plans = plans
    restaurant.isDelivery = isDelivery
    restaurants.push(restaurant)
  })
  setTimeout(() => {
    res.json(restaurants);
  }, 8000)

});
// filter by cuisine_type

router.route("/searchbycity/:inputcity").get(async function (req, res) {
  const { inputcity } = req.params;
  const response = await NewRestaurant.find({ $and: [{ status: "Active" }, { city: inputcity }] })
  let restaurants = []
  response.forEach(async (restaurant) => {
    const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id })
    const { items } = meals.find(meal => meal.category === 'Lunch')
    const { isDelivery, price_plans } = await Price.findOne({ restaurant_id: restaurant.restaurant_id })
    const { plans } = price_plans.find((plan) => plan.category === 'Lunch')
    restaurant.meals = items
    restaurant.price_plans = plans
    restaurant.isDelivery = isDelivery
    restaurants.push(restaurant)
  })
  setTimeout(() => {
    res.json(restaurants);
  }, 8000)

});
// filter by cuisine_type

router.route("/category/:food").get(async function (req, res) {
  const { food } = req.params;
  const response = await NewRestaurant.find({ status: "Active" })
  let restaurants = []
  response.forEach(async (restaurant) => {
    const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id })
    const { items } = meals.find(meal => meal.category === food)
    const promo = await Coupon.findOne({ $and: [{ restaurant_id: restaurant.restaurant_id }, { status: "Active" }] })
    const { isDelivery, price_plans } = await Price.findOne({ restaurant_id: restaurant.restaurant_id })
    const { plans } = price_plans.find((plan) => plan.category === food)
    restaurant.meals = items
    restaurant.price_plans = plans
    restaurant.isDelivery = isDelivery
    restaurant.promo = promo
    restaurants.push(restaurant)
  })
  setTimeout(() => {
    res.json(restaurants);
  }, 8000)
})
// filter by lunch dinner

router.route("/filterpickup/:food").get(async function (req, res) {
  const { food } = req.params;
  const response = await NewRestaurant.find({ status: "Active" })
  let restaurants = []
  response.forEach(async (restaurant) => {
    const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id })
    const { items } = meals.find(meal => meal.category === food)
    const { isDelivery, price_plans } = await Price.findOne({ restaurant_id: restaurant.restaurant_id })
    const { plans } = price_plans.find((plan) => plan.category === food)
    const promo = await Coupon.findOne({ $and: [{ restaurant_id: restaurant.restaurant_id }, { status: "Active" }] })
    restaurant.meals = items
    restaurant.price_plans = plans
    restaurant.isDelivery = isDelivery
    restaurant.promo = promo
    restaurants.push(restaurant)
  })
  setTimeout(() => {
    res.json(restaurants);
  }, 8000)
})
// filter by lunch dinner

router.route("/meal_type/:meal_type").get(async function (req, res) {
  const { meal_type } = req.params;
  const restaurants = await NewRestaurant.find({ $and: [{ status: "Active" }, { meal_type: meal_type }] })
  res.json(restaurants)

});
// filter by veg non-veg

router.route("/price/:order").get(function (req, res) {
  const order = req.params.order;
  NewRestaurant.find(function (err, restaurants) {
    if (!err) {
      function compare(a, b) {
        let p1 = a.plan.twoPlan.base_2price;
        let p2 = b.plan.twoPlan.base_2price;
        if (order === "asc") {
          return parseFloat(p1) - parseFloat(p2);
        } else {
          return parseFloat(p2) - parseFloat(p1);
        }
      }
      const filtered_restaurant = restaurants.sort(compare);
      res.json(filtered_restaurant);
    }
  });
});
// filter by price

router.route("/").delete((req, res, next) => {
  NewRestaurant.deleteMany({}, (err, resp) => {
    res.json({ msg: "All Deleted" });
  });
});
//delete all

router.route("/push_promo").put(async (req, res) => {
  const id = req.body._id;
  const { coupon } = req.body;
  NewRestaurant.findById(id, function (err, rest) {
    if (rest) {
      rest.promo.push(coupon);
      rest
        .save()
        .then((rest) => rest)
        .then((restaurant) => {
          res.json({
            statusText: "updated",
            data: restaurant,
            msg: "Coupon Added Successfully",
          });
        })
        .catch((err) => {
          res.status(400).send("adding new coupon failed");
        });
    } else {
      res.json({ statusText: "NF", msg: "Please login first to proceed" });
    }
  });
});
//

router.route("/getorders/:restaurant_id").get(async (req, res) => {
  const response = await NewRestaurant.findOne({
    restaurant_id: req.params.restaurant_id,
  });
  const profile_pic = await response.documents[1].banner_image;
  const myorders = await Orders.find({
    restaurant_id: req.params.restaurant_id,
  });
  const totalOrders = await myorders.length;
  const meals = await response.meals;
  res.json({
    totalOrders: totalOrders,
    meals: meals,
    profile_pic: profile_pic,
  });
});

router.route("/chefdashboard/:restaurant_id").get(async (req, res) => {
  const { restaurant_id } = req.params
  const myorders = await Orders.find({ restaurant_id });
  const { isDelivery, price_plans } = await Price.findOne({ restaurant_id })
  const { menuvisits, cartvisits } = await RestaurantDashboard.findOne({ restaurant_id })
  const totalorders = myorders.length; //Total Orders

  const accepted = myorders.filter(item => item.status === "accepted");
  const planwiseOrders = myorders.filter(order => order.status !== "rejected")
    .flatMap(order => price_plans.filter(plan => plan.category === order.category)
      .flatMap(plan => plan.plans.filter(item => item.plan_name === order.plan_name)
        .map(item => ({
          plan_name: item.plan_name,
          discount: order.discount,
          base_price: order.base_price,
          delivery_fee: order.delivery_fee
        }))));
  const singleMeals = planwiseOrders.filter(order => order.plan_name === "1 Meal");
  const twoMeals = planwiseOrders.filter(order => order.plan_name === "2 Meals");
  const sevenMeals = planwiseOrders.filter(order => order.plan_name === "7 Meals");
  const fifteenMeals = planwiseOrders.filter(order => order.plan_name === "15 Meals");
  const thirtyMeals = planwiseOrders.filter(order => order.plan_name === "30 Meals");

  const calculateRevenue = (meals, planName) => {
    const basePrice = meals.filter(item => item.plan_name === planName).map(item => item.base_price).reduce(add, 0);
    const deliveryFee = meals.filter(item => item.plan_name === planName).map(item => item.delivery_fee).filter(x => Number(x)).reduce(add, 0);
    const discount = meals.filter(item => item.plan_name === planName).map(item => item.discount).reduce(add, 0);
    return { plan_name: planName, revenue: basePrice, delivery_fee: deliveryFee, discount: discount };
  }

  const allRevenue = [
    calculateRevenue(accepted, "1 Meal"),
    calculateRevenue(planwiseOrders, "2 Meals"),
    calculateRevenue(sevenMeals, "7 Meals"),
    calculateRevenue(fifteenMeals, "15 Meals"),
    calculateRevenue(thirtyMeals, "30 Meals")
  ];

  const statusTypes = ["pending", "started", "completed", "cancelled", "rejected"];
  const statusCounts = statusTypes.reduce((acc, status) => {
    acc[`${status}Count`] = myorders.filter((item) => item.status === status).length;
    return acc;
  }, {});

  const totalRevenue = allRevenue.reduce((acc, item) => acc + item.revenue, 0);
  const totalSales = totalRevenue + allRevenue.reduce((acc, item) => acc + item.delivery_fee, 0) - allRevenue.reduce((acc, item) => acc + item.discount, 0);
  const acceptanceRate = ((statusCounts.acceptedCount + statusCounts.startedCount + statusCounts.completedCount + statusCounts.cancelledCount) / totalorders * 100 || 0).toFixed(2);
  const rejectanceRate = ((statusCounts.rejectedCount / totalorders) * 100 || 0).toFixed(2);

  res.json({
    totalSales,
    totalRevenue,
    singleMeals,
    twoMeals,
    sevenMeals,
    fifteenMeals,
    thirtyMeals,
    planwiseOrders,
    allRevenue,
    totalorders,
    acceptedCount: statusCounts.acceptedCount,
    pendingCount: statusCounts.pendingCount,
    startedCount: statusCounts.startedCount,
    completedCount: statusCounts.completedCount,
    cancelledCount: statusCounts.cancelledCount,
    rejectedCount: statusCounts.rejectedCount,
    acceptanceRate,
    rejectanceRate,
    menuvisits,
    cartvisits
  });
});

router
  .route("/getchefbyIdupdatemenucount/:restaurant")
  .get(async (req, res) => {
    const response = await RestaurantDashboard.findOne({ restaurant_id: req.params.restaurant })
    let { menuvisits, _id } = response;
    menuvisits = parseInt(menuvisits) + 1;
    const dash = await RestaurantDashboard.findByIdAndUpdate(_id, { menuvisits: menuvisits })
    res.json(dash)
  });

router.route("/getchefbyIdandupdatecartcount/:restaurant").get(async (req, res) => {
  const response = await RestaurantDashboard.findOne({ restaurant_id: req.params.restaurant })
  let { cartvisits, _id } = response;
  cartvisits = parseInt(cartvisits) + 1;
  const docs = await RestaurantDashboard.findByIdAndUpdate(_id, { cartvisits: cartvisits })
  res.json(docs)
});


module.exports = router;
