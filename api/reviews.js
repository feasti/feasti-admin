const express = require("express");
const router = express.Router();
const Review = require("../models/review.model");

router.route("/").get(async (req, res) => {
  try {
    const review = await Review.find();
    res.json(review);
  } catch (err) {
    console.log(err);
  }
});
//get all orders

router.route("/:id").get(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  res.json(review);
});
//get specific review

router.route("/getmyreview/:restaurant_id").get(async (req, res) => {
  const { restaurant_id } = req.params;
  const review = await Review.find({ restaurant_id });
  res.json(review);
});
//get specific review

router.route("/getreviewByUser/:id/:order_id").get(async (req, res) => {
  const { id, order_id } = req.params;
  const review = await Review.find({
    $and: [
      { user_id: id },
      { order_id: order_id },
    ],
  });
  res.json({ hasReview: review.length !== 0, review });
});
//get specific review

router.route("/:id").put(async (req, res) => {
  const { id } = req.params;
  const response = await Review.findByIdAndUpdate(id, req.body, { new: true });
  res.json(response);
});

router.route("/").post(async (req, res) => {
  try {
    const review = new Review(req.body);
    const response = await review.save();
    res.json({ data: response, msg: "Review Placed!", status: 200 });
  } catch (err) {
    res.status(400).send("Failed");
  }
});
//save a review

router.route("/:id").delete(async (req, res) => {
  const { id } = req.params;
  const response = await Review.findByIdAndDelete(id);
  if (response) {
    res.json({ status: 200, msg: "Deleted", data: response });
  }
});
//delete single review

router.route("/").delete(async (req, res) => {
  await Review.deleteMany({});
  res.json({ msg: "All Deleted" });
});
//delete all

module.exports = router;
