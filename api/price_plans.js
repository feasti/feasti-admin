const express = require("express");
const router = express.Router();
const PricePlans = require("../models/price_plan.model");
const Plan = require('../models/plans.model')

router.route("/").get(function (req, res) {
    PricePlans.find(function (err, plans) {
        !err && res.json(plans);
    });
});
// Get all plan

router.route("/:id").get(function (req, res) {
    const { id } = req.params;
    PricePlans.findById(id, (err, user) => {
        res.json(user);
    });
});
// Get a single plan

router.put("/:id", async (req, res) => {
    const { id } = req.params
    const { plans } = req.body;
    const response = await PricePlans.findByIdAndUpdate(id, plans)
    res.json(response)
});
//Update a plan


router.put('/updatefromchef/:restaurant_id', async (req, res) => {
    const { restaurant_id } = req.params
    const { plans, category, index } = req.body
    let { price_plans, isDelivery } = await PricePlans.findOne({ restaurant_id: restaurant_id })
    let margins = await Plan.find({})
    let planToUpdate = price_plans.find((plan) => plan.category === category)
    // planToUpdate.plans = plans

    res.json({
        restaurant_id,
        plans: planToUpdate.plans[index],
        margins
    })

})

router.route("/:id").delete(async (req, res,) => {
    const { id } = req.params
    const data = PricePlans.findByIdAndDelete(id);
    res.json(data)
});
// Delete a plan

module.exports = router;
