const express = require("express");
const router = express.Router();

const stripe = require("stripe")("pk_live_51KammvB9SdGdzaTpIkJAtj4dhfOGUk1GYo4l9tTl4CYya4TQgZkmijukVNmdRuF920fnP5eJmpoAsVKvMlNTNwRb00lIFQ4nl0", {
  apiVersion: "2020-08-27",
  appInfo: {
    name: "feasti dash inc",
    version: "0.0.2",
    url: "https://github.com/stripe-samples",
  },
});

const stripe_us = require("stripe")(process.env.STRIPE_SECRET_KEY_US_TEST, {
  apiVersion: "2020-08-27",
  appInfo: {
    name: "feasti dash inc",
    version: "0.0.2",
    url: "https://github.com/stripe-samples",
  },
});

router.route("/create-payment-intent").post(async (req, res) => {
  const {
    paymentMethodId,
    paymentIntentId,
    items,
    currency,
    useStripeSdk,
    amount,
  } = req.body;

  let customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2020-08-27" }
  );
  const params = {
    amount: amount,
    currency: currency,
    payment_method: paymentMethodId,
    payment_method_types: ["card"],
    customer: customer.id,
    confirmation_method: "manual",
    confirm: true,
    use_stripe_sdk: useStripeSdk,
  };
  try {
    let paymentIntent;
    if (paymentMethodId) {
      paymentIntent = await stripe.paymentIntents.create(params);
    } else if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    }
    res.send(generateResponse(paymentIntent));
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

router.route("/charge/:currency").post(async (req, res) => {
  const { token, amount, user_id } = req.body;
  const charge = await stripe.charges.create({
    amount: amount * 100,
    currency: req.params.currency,
    description: `Wallet Recharge for ${user_id}`,
    source: token,
  });
  res.send(charge);
});

router.route("/pay/:currency").post(async (req, res) => {
  const { token, amount, user_id, restaurant_id, plan_name } = req.body;
  const currency = req.params.currency
  try {
    let charge = null
    if (currency === 'CAD') {
      charge = await stripe.charges.create({
        amount: parseInt(amount * 100),
        currency: 'CAD',
        description: `Amount of $${amount} has been received for ${plan_name} from ${user_id} `,
        source: token,
        metadata: {
          user_id: user_id,
          restaurant_id: restaurant_id,
          plan_name: plan_name,
        },
      });
    } else {
      charge = await stripe_us.charges.create({
        amount: parseInt(amount * 100),
        currency: 'USD',
        description: `Amount of $${amount} has been received for ${plan_name} from ${user_id} `,
        source: token,
        metadata: {
          user_id: user_id,
          restaurant_id: restaurant_id,
          plan_name: plan_name,
        },
      });
    }
    res.send(charge);
  } catch (err) {
    res.send(err)
  }
});

const generateResponse = (intent) => {
  switch (intent.status) {
    case "requires_action":
    case "requires_source_action":
      return {
        requiresAction: true,
        clientSecret: intent.client_secret,
      };
    case "requires_payment_method":
    case "requires_source":
      // Card was not properly authenticated, suggest a new payment method
      return {
        error: "Your card was denied, please provide a new payment method",
      };
    case "succeeded":
      console.log("💰 Payment received!");
      return { clientSecret: intent.client_secret };
  }
};
module.exports = router;
