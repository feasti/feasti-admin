const express = require("express");
const router = express.Router();
const Plan = require("../models/plans.model");

router.route("/").get(async (req, res) => {
  const plans = await Plan.find({})
  res.json(plans);

});
router.route('/getProfitMargin').get(async (req, res) => {
  const plans = await Plan.find({}, { plan_name: 1, profit_margin: 1, _id: 0 })
  res.json(plans)
})
router.route("/:id").get(function (req, res) {
  let id = req.params.id;
  Plan.findById(id, function (err, user) {
    res.json(user);
  });
});

router.put("/:id", function (req, res) {
  let id = req.params.id;
  let { plans } = req.body;
  Plan.findByIdAndUpdate(id, plans, function (err, resp) {
    res.json(plans);
  });
});
//add an address

router.route("/").post(async (req, res) => {
  const { plan } = req.body
  const plans = new Plan(plan)
  const response = await plans.save()
  res.json(response)
});
//update a plan
router.route("/:id").delete(async function (req, res, next) {
  const data = await Plan.findByIdAndDelete(req.params.id)
  res.json({ msg: "Plan Deleted", data })
});
router.put('/update', async function (req, res) {
  const { plans } = req.body
  const response = Plan.updateMany({}, plans)
  res.json(response)
})

module.exports = router;
