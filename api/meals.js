const express = require("express");
const router = express.Router();
const Meals = require('../models/meals.model')

router.route("/").get(async function (req, res) {
    const meals = await Meals.find({})
    res.json(meals)
});
// get all restaurant for admin

router.route("/:id/:type").get(async function (req, res) {
    const { meals } = await Meals.findOne({ restaurant_id: req.params.id })
    const { items } = meals.find(meal => meal.category === req.params.type)
    res.json(items)
});
// get all restaurant for admin



// router.route("/:id").delete(async (req, res, next) => {
//     const { id } = req.params
//     const response = await NewRestaurant.findByIdAndDelete(id)
//     res.json({
//         status: 200,
//         msg: "Deleted"
//     })
// });
// //delete a restaurant

// router.route("/").post(async function (req, res) {
//     let restaurant = new NewRestaurant(req.body);
//     const response = await restaurant.save()
//     res.json({
//         data: restaurant,
//         status: 200,
//         msg: "Restaurant Added Successfully",
//     });
// });
// //save a restaurant

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
// //update a restaurant

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
//get specific restaurant



module.exports = router;
