const express = require("express");
const router = express.Router();
const Meals = require('../models/meals.model')
const Restaurant = require('../models/newrest.model')

router.route("/").get(async function (req, res) {
    const meals = await Meals.find({})
    res.json(meals)
});
// get all restaurant for admin

router.route("/:id/:type").get(async function (req, res) {
    const { id, type } = req.params
    const { meals } = await Meals.findOne({ restaurant_id: id })
    const { items } = meals.find(meal => type.localeCompare(meal.category))
    res.json(items)
});
// get all meals for a restaurant by its id for either lunch or dinner



// router.route("/:id").delete(async (req, res, next) => {
//     const { id } = req.params
//     const response = await NewRestaurant.findByIdAndDelete(id)
//     res.json({
//         status: 200,
//         msg: "Deleted"
//     })
// });
// //delete a meal

// router.route("/").post(async function (req, res) {
//     let restaurant = new NewRestaurant(req.body);
//     const response = await restaurant.save()
//     res.json({
//         data: restaurant,
//         status: 200,
//         msg: "Restaurant Added Successfully",
//     });
// });
// //save a meal

// router.route("/:id").put(function (req, res, next) {
//     NewRestaurant.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         function (err, restaurant) {
//             if (err) return next(err);
//             res.json(restaurant);
//         }
//     );
// });
// //update a meal

router.route("/:id").get(async function (req, res) {
    let { id } = req.params;
    const response = await NewRestaurant.findById(id)
    const meals = await Meals.find({})
    let restaurant = response
    meals.forEach((meal) => {
        if (restaurant.restaurant_id === meal.restaurant_id) {
            restaurant.meals = meal.meals
        }
    })
    res.json(restaurant)
});
//get specific meal



module.exports = router;
