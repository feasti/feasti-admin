const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_CANADA_LIVE, {
  apiVersion: "2020-08-27",
  appInfo: {
    name: "feasti dash inc",
    version: "0.0.2",
    url: "https://feasti.com",
  },
});
//Set Stripe secret key for Canada 

const stripe_us = require("stripe")(process.env.STRIPE_SECRET_KEY_US_LIVE, {
  apiVersion: "2020-08-27",
  appInfo: {
    name: "feasti dash inc",
    version: "0.0.2",
    url: "https://feasti.com",
  },
});
//Set Stripe secret key for US

router.route("/create-payment-intent").post(async (req, res) => {
  const { paymentMethodId, paymentIntentId, items, currency, useStripeSdk, amount } = req.body;
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: "2020-08-27" });
  const params = {
    amount,
    currency,
    payment_method: paymentMethodId,
    payment_method_types: ["card"],
    customer: customer.id,
    confirmation_method: "manual",
    confirm: true,
    use_stripe_sdk: useStripeSdk
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
    return res.status(400).send({ error: { message: e.message } });
  }
});
// Create stripe payment intent

router.route("/charge/:currency").post(async (req, res) => {
  const { token, amount, user_id } = req.body;
  const currency = req.params.currency;
  try {
    const charge = await (currency === 'CAD' ? stripe.charges.create : stripe_us.charges.create)({
      amount: parseInt(amount * 100),
      currency: currency === 'CAD' ? 'CAD' : 'USD',
      description: `Wallet Recharge for ${user_id}`,
      source: token,
    });
    res.send(charge);
  } catch (err) {
    res.send(err);
  }

});
// Api to recharge a wallet

router.route("/pay/:currency").post(async (req, res) => {
  const { token, amount, user_id, restaurant_id, plan_name } = req.body;
  const currency = req.params.currency;
  try {
    let charge;
    if (currency === 'CAD') {
      charge = await stripe.charges.create({
        amount: parseInt(amount * 100),
        currency: 'CAD',
        description: `Amount of $${amount} has been received for ${plan_name} from ${user_id}`,
        source: token,
        metadata: { user_id, restaurant_id, plan_name }
      });
    } else {
      charge = await stripe_us.charges.create({
        amount: parseInt(amount * 100),
        currency: 'USD',
        description: `Amount of $${amount} has been received for ${plan_name} from ${user_id}`,
        source: token,
        metadata: { user_id, restaurant_id, plan_name }
      });
    } res.send(charge);
  } catch (err) {
    res.send(err);
  }
});
// Api to charge a user when he has placed an order

const generateResponse = (intent) => {
  if (intent.status === "requires_action" || intent.status === "requires_source_action") {
    return {
      requiresAction: true,
      clientSecret: intent.client_secret,
    };
  } else if (intent.status === "requires_payment_method" || intent.status === "requires_source") {
    return {
      error: "Your card was denied, please provide a new payment method",
    };
  } else if (intent.status === "succeeded") {
    console.log("💰 Payment received!");
    return { clientSecret: intent.client_secret };
  }
};
// Utility method to generate a response after a payment is successful

module.exports = router;
