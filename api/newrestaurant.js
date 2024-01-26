const express = require("express");
const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const uploadFileToS3 = require('../utility/upload')
const { add } = require('../utility/utility')
const router = express.Router();
const NewRestaurant = require("../models/newrest.model");
const Meals = require('../models/meals.model')
const Orders = require("../models/orders.model");
const Price = require("../models/price_plan.model")
const Coupon = require('../models/coupons.model')
const Banner = require("../models/banners.model")
const RestaurantDashboard = require('../models/restaurant_dashboard.model')
const mkdir = promisify(fs.mkdir)
const multer = require('multer')

const storage = multer.memoryStorage();
const upload = multer({ storage })
const uploadFields = [
  { name: 'banner_image', maxCount: 1 },
  { name: 'profile_picture', maxCount: 1 },
  { name: 'papers', maxCount: 5 }
];


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
  try {
    let restaurant = await NewRestaurant.findOne({ $and: [{ phone: req.body.phone }, { $ne: { status: 'unapproved' } }] }).exec();
    if (restaurant) {
      const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id })
      const { price_plans, isDelivery } = await Price.findOne({ restaurant_id: restaurant.restaurant_id })
      const coupon = await Coupon.findOne({ restaurant_id: restaurant.restaurant_id, status: "Active" })
      restaurant.meals = meals.meals;
      restaurant.isDelivery = isDelivery;
      restaurant.price_plans = price_plans;
      restaurant.promo = coupon;
      res.json({ status: 200, data: restaurant });
    } else {
      res.json({ status: 404, data: null })
    }
  } catch (error) {
    res.json({ status: 404, data: null, error: error })
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

router.post('/create_chef_basic', async (req, res) => {
  const count = await NewRestaurant.count();
  const restId = `REST${(count + 1).toString().padStart(4, "0")}`;
  const mealsData = { restaurant_id: restId, meals: [{ category: "Lunch", items: [] }, { category: "Dinner", items: [] }] };
  const priceData = { restaurant_id: restId, isDelivery: false, price_plans: [{ category: "Lunch", plans: [] }, { category: "Dinner", plans: [] }] };
  const restaurant = await NewRestaurant.create({ ...req.body, restaurant_id: restId });
  await Meals.create({ ...mealsData });
  await Price.create({ ...priceData });
  res.json({
    ...restaurant,
    status: 200,
    msg: "Restaurant Added Successfully",
  });
})

router.put('/upload_docs/:id', upload.fields(uploadFields), async (req, res) => {
  const { id } = req.params
  const files = req.files
  const { banner_image, profile_picture, papers } = files

  console.log(files, id);
})
router.post("/", upload.fields(uploadFields), async (req, res) => {
  const formdata = await req.body
  const files = req.files
  const { banner_image, profile_picture, papers } = files
  console.log(formdata);


  try {
    // await mkdir(path.join(__dirname, 'meals', restId));

    // Upload the banner image to the 'banners' folder with the restaurant ID as the filename
    const bannerImageUrl = await uploadFileToS3(banner_image, 'banners', `${restId}.jpg`);

    // Upload the profile picture to the 'profile_pictures' folder with the restaurant ID as the filename
    const profilePictureUrl = await uploadFileToS3(profile_picture, 'profile_pictures', `${restId}.jpg`);

    // Save the restaurant data to the database
    const restaurant = await NewRestaurant.create({
      ...formdata,
      restaurant_id: restId,
      documents: [
        { banner_image: bannerImageUrl },
        { profile_picture: profilePictureUrl }
      ]
    });
    await Meals.create(mealsData);
    await Price.create(priceData);
    res.json({
      data: restaurant,
      status: 200,
      bannerImageUrl,
      profilePictureUrl,
      msg: "Restaurant Added Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to add restaurant' })
  }
});
//save a restaurant

router.put("/:id", async (req, res) => {
  const restaurant = await NewRestaurant.findByIdAndUpdate(req.params.id, req.body);
  res.json(restaurant);
});
//update a restaurant

router.route("/:id").get(async function (req, res) {
  let { id } = req.params;
  const restaurant = await NewRestaurant.findById(id).populate('meals');
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
  const restaurants = await NewRestaurant.find({ status: "Active", $or: [{ "cuisine_type.0": cuisine }, { cuisine_type: cuisine }] });

  const getRestaurantDetails = async (restaurant, category) => {
    const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id });
    const meal = meals.find(meal => meal.category === category);
    if (meal) {
      const { items } = meal;
      const { isDelivery, price_plans } = await Price.findOne({ restaurant_id: restaurant.restaurant_id });
      const plan = price_plans.find(plan => plan.category === category);
      if (items && isDelivery && plan) {
        return { ...restaurant.toObject(), meals: items, price_plans: plan.plans, isDelivery };
      }
    }
    return null;
  };

  const filteredRestaurants = await Promise.all(restaurants.map(async restaurant => getRestaurantDetails(restaurant, 'Lunch')));
  if (filteredRestaurants.some(restaurant => restaurant)) {
    res.json(filteredRestaurants.filter(restaurant => restaurant && restaurant.cuisine_type.includes(cuisine)));
  } else {
    const restaurantsWithDinner = await Promise.all(restaurants.map(async restaurant => getRestaurantDetails(restaurant, 'Dinner')));
    res.json(restaurantsWithDinner.filter(restaurant => restaurant && restaurant.cuisine_type.includes(cuisine)));
  }
});



router.route("/searchbycity/:inputcity").get(async function (req, res) {
  const { inputcity } = req.params;
  const regex = new RegExp(inputcity, "i");
  const restaurants = await NewRestaurant.find({
    status: "Active",
    $or: [
      { restaurant_name: { $regex: regex } },
      { city: { $regex: regex } },
      { cuisine_type: { $regex: regex } }
    ]
  });

  const getRestaurantDetails = async (restaurant, category) => {
    const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id });
    const meal = meals.find(meal => meal.category === category);
    const { isDelivery, price_plans } = await Price.findOne({ restaurant_id: restaurant.restaurant_id });
    const plan = price_plans.find(plan => plan.category === category);
    if (meal && plan) {
      const { items } = meal;
      return { ...restaurant.toObject(), meals: items, price_plans: plan.plans, isDelivery };
    }
    return null;
  };

  const filteredRestaurantsLunch = await Promise.all(restaurants.map(async restaurant => await getRestaurantDetails(restaurant, 'Lunch')));
  const filteredRestaurantsDinner = await Promise.all(restaurants.map(async restaurant => await getRestaurantDetails(restaurant, 'Dinner')));

  // Filter out restaurants with null values for both lunch and dinner
  const filteredRestaurants = filteredRestaurantsLunch.concat(filteredRestaurantsDinner).filter(restaurant => restaurant);

  res.json(filteredRestaurants);
});

// filter by cuisine_type

router.route("/category/:food").get(async function (req, res) {
  const { food } = req.params;
  const response = await NewRestaurant.find({ status: "Active" })
  let restaurants = []
  response.forEach(async (restaurant) => {
    const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id })
    const { items } = meals.find(meal => meal.category === food)
    const { isDelivery, price_plans } = await Price.findOne({ restaurant_id: restaurant.restaurant_id })
    const { plans } = price_plans.find((plan) => plan.category === food)
    if (items.length > 0 && plans.length > 0) {
      const promo = await Coupon.findOne({ $and: [{ restaurant_id: restaurant.restaurant_id }, { status: "Active" }] })
      restaurant.meals = items
      restaurant.price_plans = plans
      restaurant.isDelivery = isDelivery
      restaurant.promo = promo
      restaurants.push(restaurant)
    }
  })
  setTimeout(() => {
    res.json(restaurants);
  }, 8000)
})
// filter by lunch dinner

const getRestaurantDetails = async (restaurant, category) => {
  const { meals } = await Meals.findOne({ restaurant_id: restaurant.restaurant_id });
  const meal = meals.find(meal => meal.category === category);
  if (meal) {
    const { items } = meal;
    const { isDelivery, price_plans } = await Price.findOne({ restaurant_id: restaurant.restaurant_id });
    const plan = price_plans.find(plan => plan.category === category);
    if (items && isDelivery && plan) {
      return { ...restaurant.toObject(), meals: items, price_plans: plan.plans, isDelivery };
    }
  }
  return null;
};

router.route("/filterpickup/:category/:isDelivery").get(async function (req, res) {
  const { category, isDelivery } = req.params;
  const restaurants = await NewRestaurant.find({ status: "Active", category, isDelivery });
  const filteredRestaurantsLunch = await Promise.all(restaurants.map(async restaurant => await getRestaurantDetails(restaurant, category)));
  res.json(filteredRestaurantsLunch);
});
// filter by lunch dinner

router.get("/meal_type/:meal_type", async (req, res) => {
  const { meal_type } = req.params;
  const restaurants = await NewRestaurant.find({ status: "Active", meal_type });
  res.json(restaurants);
});
// filter by veg non-veg

router.route("/price/:order").get(async function (req, res) {
  const order = req.params.order;
  const restaurants = await NewRestaurant.find({});
  const sortedRestaurants = restaurants.sort((a, b) => {
    const p1 = parseFloat(a.plan.twoPlan.base_2price);
    const p2 = parseFloat(b.plan.twoPlan.base_2price);
    return order === "asc" ? p1 - p2 : p2 - p1;
  });
  res.json(sortedRestaurants);
});
// filter by price

router.delete("/", async (req, res) => {
  await NewRestaurant.deleteMany({});
  res.json({ msg: "All Deleted" });
});
//delete all

router.route("/push_promo").put(async (req, res) => {
  const { _id, coupon } = req.body;
  try {
    const rest = await NewRestaurant.findById(_id);
    if (rest) {
      rest.promo.push(coupon);
      const restaurant = await rest.save();
      res.json({
        statusText: "updated",
        data: restaurant,
        msg: "Coupon Added Successfully",
      });
    } else {
      res.json({ statusText: "NF", msg: "Please login first to proceed" });
    }
  } catch (err) {
    res.status(400).send("adding new coupon failed");
  }
});
//

router.route("/getorders/:restaurant_id").get(async (req, res) => {
  const { restaurant_id } = req.params;
  const response = await NewRestaurant.findOne({ restaurant_id });
  const { banner_image } = response.documents[1];
  const meals = response.meals;
  const totalOrders = await Orders.countDocuments({ restaurant_id });
  res.json({ totalOrders, meals, profile_pic: banner_image });
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
          discount: (order.promo_id !== "PROMOADMIN") ? order.discount : 0, // Apply discount only if promo_id is not "PROMOADMIN"
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

  const statusTypes = ["pending", "accepted", "started", "completed", "cancelled", "rejected"];
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

router.get("/getchefbyIdupdatemenucount/:restaurant_id", async (req, res) => {
  const { restaurant_id } = req.params;
  const response = await RestaurantDashboard.findOneAndUpdate({ restaurant_id }, { $inc: { menuvisits: 1 } }, { new: true });
  res.json(response);
});

function generateShareCode() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let sharecode = '';
  for (let i = 0; i < 3; i++) {
    sharecode += `${characters.charAt(Math.floor(Math.random() * characters.length))}${characters.charAt(Math.floor(Math.random() * characters.length))}`;
    if (i < 2) {
      sharecode += '-';
    }
  }
  return sharecode;
}

router.get('/share/:restaurant_id', async (req, res) => {
  const { restaurant_id } = req.params;
  const response = await NewRestaurant.findOne({ restaurant_id });
  response.sharecode = response.sharecode || generateShareCode();
  await response.save();
  res.json(response);
});

router.get('/getchefByShareCode/:sharecode', async (req, res) => {
  const { _id } = await NewRestaurant.findOne({ sharecode: req.params.sharecode });
  res.json(_id);
})

router.get("/getchefbyIdandupdatecartcount/:restaurant_id", async (req, res) => {
  const { restaurant_id } = req.params;
  const response = await RestaurantDashboard.findOneAndUpdate({ restaurant_id }, { $inc: { cartvisits: 1 } }, { new: true });
  res.json(response);
});

module.exports = router;
