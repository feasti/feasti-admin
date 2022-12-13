const express = require("express");
const router = express.Router();
const NewRestaurant = require("../models/newrest.model");
const Meals = require('../models/meals.model')
const Orders = require("../models/orders.model");
const Price = require("../models/price_plan.model")
const Coupon = require('../models/coupons.model')
const Banner = require("../models/banners.model")

const add = (accumulator, curr) => parseFloat(accumulator) + parseFloat(curr);

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
    res.json({ status: 200, data: restaurant, coupon });
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
  let restaurant = new NewRestaurant(req.body);
  const response = await restaurant.save()
  res.json({
    data: response,
    status: 200,
    msg: "Restaurant Added Successfully",
  });
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
  const myorders = await Orders.find({ restaurant_id: restaurant_id });
  const { isDelivery, price_plans } = await Price.findOne({ restaurant_id: restaurant_id })
  const totalorders = myorders.length; //Total Orders

  let accepted = myorders.filter((item) => item.status === "accepted");
  let planwiseOrders = []
  let singleMeals = []
  let twoMeals = []
  let sevenMeals = []
  let fifteenMeals = []
  let thirtyMeals = []
  price_plans.filter((plan) => {
    myorders.filter((order) => {
      const { plans } = plan
      if (order.category === plan.category) {
        plans.filter((item) => {
          if (item.plan_name === order.plan_name) {
            let mealOrder = {}
            mealOrder.plan_name = order.plan_name
            mealOrder.discount = order.discount
            mealOrder.base_price = order.base_price
            mealOrder.delivery_fee = order.delivery_fee
            planwiseOrders.push(mealOrder)
          }
        })
      }
    })
  })

  planwiseOrders.map((planwiseorder) => {
    if (planwiseorder.plan_name === "1 Meal") {
      singleMeals.push(planwiseorder)
    }
    if (planwiseorder.plan_name === "2 Meals") {
      twoMeals.push(planwiseorder)
    }
    if (planwiseorder.plan_name === "7 Meals") {
      sevenMeals.push(planwiseorder)
    }
    if (planwiseorder.plan_name === "15 Meals") {
      fifteenMeals.push(planwiseorder)
    }
    if (planwiseorder.plan_name === "30 Meals") {
      thirtyMeals.push(planwiseorder)
    }
  })

  let allRevenue = []
  let revenue = {}
  let singelMealBasePrice = singleMeals.map((item) => item.base_price);
  let singleMealRevenue = singelMealBasePrice.reduce(add, 0);
  let singelMealDelivery = singleMeals.map((item) => item.delivery_fee);
  singelMealDelivery = singelMealDelivery.filter((x) => Number(x))
  let singleDeliveryFee = singelMealDelivery.reduce(add, 0);
  let singelMealDiscount = singleMeals.map((item) => item.discount);
  let singleDiscount = singelMealDiscount.reduce(add, 0);
  revenue = {
    plan_name: "1 Meal",
    revenue: singleMealRevenue,
    delivery_fee: singleDeliveryFee,
    discount: singleDiscount
  }
  allRevenue.push(revenue)


  let twoMealBasePrice = twoMeals.map((item) => item.base_price);
  let twoMealRevenue = twoMealBasePrice.reduce(add, 0);
  let twoMealDelivery = twoMeals.map((item) => item.delivery_fee);
  twoMealDelivery = twoMealDelivery.filter((x) => Number(x))
  let twoDeliveryFee = twoMealDelivery.reduce(add, 0);
  let twoMealDiscount = twoMeals.map((item) => item.discount);
  let twoDiscount = twoMealDiscount.reduce(add, 0);
  revenue = {
    plan_name: "2 Meals",
    revenue: twoMealRevenue,
    delivery_fee: twoDeliveryFee,
    discount: twoDiscount
  }
  allRevenue.push(revenue)

  let sevenMealBasePrice = sevenMeals.map((item) => item.base_price);
  let sevenMealRevenue = sevenMealBasePrice.reduce(add, 0);
  let sevenMealDelivery = sevenMeals.map((item) => item.delivery_fee);
  sevenMealDelivery = sevenMealDelivery.filter(x => Number(x))
  let sevenDeliveryFee = sevenMealDelivery.reduce(add, 0);
  let sevenMealDiscount = sevenMeals.map((item) => item.discount);
  let sevenDiscount = sevenMealDiscount.reduce(add, 0);
  revenue = {
    plan_name: "7 Meals",
    revenue: sevenMealRevenue,
    delivery_fee: sevenDeliveryFee,
    discount: sevenDiscount
  }
  allRevenue.push(revenue)

  let fifteenMealBasePrice = fifteenMeals.map((item) => item.base_price);
  let fifteenMealRevenue = fifteenMealBasePrice.reduce(add, 0);
  let fifteenMealDelivery = fifteenMeals.map((item) => item.delivery_fee);
  fifteenMealDelivery = fifteenMealDelivery.filter(x => Number(x))
  let fifteenDeliveryFee = fifteenMealDelivery.reduce(add, 0);
  let fifteenMealDiscount = fifteenMeals.map((item) => item.discount);
  let fifteenDiscount = fifteenMealDiscount.reduce(add, 0);
  revenue = {
    plan_name: "15 Meals",
    revenue: fifteenMealRevenue,
    delivery_fee: fifteenDeliveryFee,
    discount: fifteenDiscount
  }
  allRevenue.push(revenue)

  let thirtyMealBasePrice = thirtyMeals.map((item) => item.base_price);
  let thirtyMealRevenue = thirtyMealBasePrice.reduce(add, 0);
  let thirtyMealDelivery = thirtyMeals.map((item) => item.delivery_fee);
  thirtyMealDelivery = thirtyMealDelivery.filter(x => Number(x))
  let thirtyDeliveryFee = thirtyMealDelivery.reduce(add, 0);
  let thirtyMealDiscount = thirtyMeals.map((item) => item.discount);
  let thirtyDiscount = thirtyMealDiscount.reduce(add, 0);
  revenue = {
    plan_name: "30 Meals",
    revenue: thirtyMealRevenue,
    delivery_fee: thirtyDeliveryFee,
    discount: thirtyDiscount
  }
  allRevenue.push(revenue)

  const pending = myorders.filter((item) => item.status === "pending");
  let started = myorders.filter((item) => item.status === "started");
  const completed = myorders.filter((item) => item.status === "completed");
  const cancelled = myorders.filter((item) => item.status === "cancelled");
  const rejected = myorders.filter((item) => item.status === "rejected");

  let totalSales = parseFloat(singleMealRevenue
    + twoMealRevenue
    + sevenMealRevenue
    + fifteenMealRevenue
    + thirtyMealRevenue)
    + parseFloat(singleDeliveryFee
      + twoDeliveryFee
      + sevenDeliveryFee
      + fifteenDeliveryFee
      + thirtyDeliveryFee)
    - parseFloat(singleDiscount
      + twoDiscount
      + sevenDiscount
      + fifteenDiscount
      + thirtyDiscount

    )
  let totalRevenue = parseFloat(singleMealRevenue
    + twoMealRevenue
    + sevenMealRevenue
    + fifteenMealRevenue
    + thirtyMealRevenue)
  const acceptedCount = accepted.length;
  const pendingCount = pending.length;
  const startedCount = started.length;
  const completedCount = completed.length;
  const cancelledCount = cancelled.length;
  const rejectedCount = rejected.length;
  const acceptanceRate = parseFloat(((acceptedCount + startedCount + completedCount + cancelledCount) / totalorders) * 100).toFixed(2)
  const rejectanceRate = parseFloat((rejectedCount / totalorders) * 100).toFixed(2)
  res.json({
    totalSales,
    totalRevenue,
    allRevenue,
    totalorders,
    acceptedCount,
    pendingCount,
    startedCount,
    completedCount,
    cancelledCount,
    rejectedCount,
    acceptanceRate,
    rejectanceRate
  })
});

module.exports = router;
