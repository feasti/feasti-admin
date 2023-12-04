const express = require("express");
const router = express.Router();
const Coupon = require("../models/admincoupon.model");
const Order = require("../models/orders.model")

router.route("/").get(async function (req, res) {
    try {
        const coupons = await Coupon.find();
        const codes = coupons.map(item => item.promo_code);
        const orders = await Order.find({ promo_id: "PROMOADMIN", promo_code: { $in: codes } });
        const prices = orders.map(item => item.price);
        const sales = prices.reduce((accumulator, a) => parseFloat(accumulator) + parseFloat(a), 0);
        const twoPlans = orders.filter(item => item.plan === "twoPlan");
        const fifteenPlan = orders.filter(item => item.plan === "fifteenPlan");
        const thirtyPlan = orders.filter(item => item.plan === "thirtyPlan");
        res.json({
            coupons,
            codes,
            sales,
            numOrders: orders.length,
            twoPlans: twoPlans.length,
            fifteenPlan: fifteenPlan.length,
            thirtyPlan: thirtyPlan.length
        });
    } catch (err) {
        res.json(err);
    }
});
//get all coupons

router.route("/:id").get(async (req, res) => {
    const { id } = req.params;
    try {
        const coupon = await Coupon.findById(id);
        res.json(coupon);
    } catch (err) {
        res.json(err);
    }
});
//get specific coupon

router.route("/:id").put(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const response = await Coupon.findByIdAndUpdate(id, data);
    res.json(response);
});
// update a coupon

router.route("/abc").get(async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (err) {
        res.json(err);
    }
});
//get all coupons

router.route("/").post(async (req, res) => {
    try {
        const coupon = await new Coupon(req.body).save();
        res.json({ status: 200, data: coupon, msg: "Added a new admin coupon" });
    } catch (err) {
        res.status(400).send("adding new Client failed");
    }
});
//save a singe coupon to database

router.route("/:id").delete(async (req, res) => {
    try {
        const data = await Coupon.findByIdAndDelete(req.params.id);
        res.json({ status: 200, data: data });
    } catch (err) {
        res.status(200).json({ data: err });
    }
});
//delete a coupon

router.route("/").delete((req, res, next) => {
    Coupon.deleteMany({}, (err, resp) => {
        res.json({ msg: "All Deleted" });
    });
});
//delete all users

module.exports = router;
