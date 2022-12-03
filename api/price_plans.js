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


router.put('/updateforchef/:restaurant_id', async (req, res) => {
    function add(accumulator, a) {
        return parseFloat(accumulator) + parseFloat(a);
    }
    const { restaurant_id } = req.params
    const { base_price, category, index } = req.body
    let { price_plans, isDelivery, _id } = await PricePlans.findOne({ restaurant_id: restaurant_id })
    let existingPlans = [...price_plans]
    let planToUpdate = price_plans.find((plan) => plan.category === category)
    const { profit_margin } = await Plan.findOne({ plan_name: planToUpdate.plans[index].plan_name })
    planToUpdate.plans[index].base_price = base_price
    planToUpdate.plans[index].customer_price = add(base_price, profit_margin)
    existingPlans[existingPlans.findIndex(x => x.category === category)] = planToUpdate
    const response = await PricePlans.findByIdAndUpdate(_id, { price_plans: existingPlans })

    // planToUpdate.plans = plans

    res.json({
        response,
        msg: "Plan Updated Successfully"
    })

})

router.route("/:id").delete(async (req, res,) => {
    const { id } = req.params
    const data = PricePlans.findByIdAndDelete(id);
    res.json(data)
});
// Delete a plan

module.exports = router;
