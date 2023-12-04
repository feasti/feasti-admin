const express = require("express");
const router = express.Router();
const Plan = require("../models/plans.model");
const PricePlans = require("../models/price_plan.model")

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
  const { id } = req.params
  let plan = req.body;
  Plan.findByIdAndUpdate(id, plan, function (err, resp) {
    res.json(plan);
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

router.route("/updatePricePlans").post(async (req, res) => {
  try {
    // Fetch all the profit margins from the plans.model
    const allPlans = await Plan.find({}, { _id: 0, profit_margin: 1, plan_name: 1 });

    // Update the price plans for all restaurants
    await PricePlans.updateMany(
      {
        $or: allPlans.map(plan => ({
          'price_plans.plans.plan_name': plan.plan_name
        }))
      },
      {
        $set: {
          'price_plans.$[outer].plans.$[inner].profit_margin': {
            $switch: {
              branches: allPlans.map(plan => ({
                case: { $eq: ['$price_plans.$[outer].plans.$[inner].plan_name', plan.plan_name] },
                then: plan.profit_margin
              })),
              default: '$price_plans.$[outer].plans.$[inner].profit_margin'
            }
          },
          'price_plans.$[outer].plans.$[inner].customer_price': {
            $add: [
              { $toDouble: '$price_plans.$[outer].plans.$[inner].base_price' },
              { $toDouble: '$price_plans.$[outer].plans.$[inner].profit_margin' }
            ]
          }
        }
      },
      {
        arrayFilters: [
          { 'outer.category': { $exists: true } },
          { 'inner.plan_name': { $in: allPlans.map(plan => plan.plan_name) } }
        ]
      }
    );

    // await PricePlans.updateMany(
    //   {
    //     'price_plans': {
    //       $elemMatch: {
    //         'plans.plan_name': { $in: ['1 Meal', '2 Meals', '7 Meals', '15 Meals', '30 Meals'] }
    //       }
    //     }
    //   },
    //   {
    //     $set: {
    //       'price_plans.$[outer].plans.$[inner].profit_margin': updatedMargins.profit_margin,
    //       'price_plans.$[outer].plans.$[inner].customer_price': {
    //         $add: [
    //           { $toDouble: '$price_plans.$[outer].plans.$[inner].base_price' },
    //           { $toDouble: updatedMargins.profit_margin }
    //         ]
    //       }
    //     }
    //   },
    //   {
    //     arrayFilters: [
    //       { 'outer.plans.plan_name': { $in: ['1 Meal', '2 Meals', '7 Meals', '15 Meals', '30 Meals'] } },
    //       { 'inner.plan_name': { $in: ['1 Meal', '2 Meals', '7 Meals', '15 Meals', '30 Meals'] } }
    //     ]
    //   }
    // )



    res.status(200).json({ message: 'Price plans updated successfully', allPlans });
    // This code updates the price plans by modifying the profit margin and customer price of specific plans.
    // It first retrieves the profit margin from the Plan collection by using the findOne() method and selecting the 'profit_margin' field.
    // Then, it uses the updateMany() method on the PricePlans collection to update multiple documents.
    // The first parameter of updateMany() is the filter object, which specifies the conditions for selecting the documents to update.
    // In this case, it uses the $elemMatch operator to match the 'price_plans' array elements that have 'plans.plan_name' values matching the specified names.
    // The second parameter of updateMany() is the update object, which contains the modifications to apply to the selected documents.
    // It uses the $set operator to set the 'profit_margin' and 'customer_price' fields of the matched elements in the 'price_plans' array.
    // The 'profit_margin' field is set to the value of 'updatedMargins.profit_margin'.
    // The 'customer_price' field is calculated using the $add operator to add the 'base_price' field (converted to a double) and the 'profit_margin' field.
    // The third parameter of updateMany() is the options object, which includes the arrayFilters property.
    // The arrayFilters property is an array of filter conditions that apply to the array fields in the update object.
    // In this case, it specifies two conditions using the dot notation to access nested fields: 'outer.plans.plan_name' and 'inner.plan_name'.
    // Finally, it sends a response with a status code of 200 and a JSON object containing a success message and the updatedMargins.
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})




module.exports = router;
