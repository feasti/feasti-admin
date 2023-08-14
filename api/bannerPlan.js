const express = require("express");
const router = express.Router();
const Banner = require("../models/bannerplan.model");

/**
 * Retrieves all banner plans from the database and sends them as a JSON response.
 * 
 * @route GET /
 * @returns {Object} JSON response with status code, fetched plans, and success message
 */
router.route("/").get(async (req, res) => {
  const banner = await Banner.find();
  res.json({ status: 200, data: banner, msg: "Plans Fetched" });
});
//get all plans

/**
 * This code snippet defines routes for handling HTTP requests related to banner plans.
 * It includes routes for adding a new plan, fetching a specific plan, updating a plan, and deleting a plan.
 */

router.route("/").post(async (req, res) => {
  const newBanner = new Banner(req.body);
  const banner = await newBanner.save();
  res.json({ status: 200, data: banner, msg: "New Plan Added" });
});
// Save a single plan

router.route("/:id").get(async (req, res) => {
  let { id } = req.params;
  const banner = await Banner.findById(id);
  res.json({ status: 200, data: banner, msg: "Banner Plan Fetched" });
});
// Get specific banner

router.route("/:id").put(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const banner = await Banner.findByIdAndUpdate(id, data);
  res.json({ status: 200, data: banner, msg: "Plan Updated" });
});
// Update a banner

router.route("/:id").delete(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findByIdAndDelete(id);
  res.json({ status: 200, data: banner, msg: "Plan Deleted" });
});
// Delete a banner

module.exports = router;
