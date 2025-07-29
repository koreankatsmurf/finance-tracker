const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, Subscription } = require('../models');
const { verifyToken } = require('../utils/auth');

const router = express.Router();

router.use(verifyToken);

// Create subscription
router.post('/create', async (req, res) => {
  try {
    const user = req.user;

    // Create Stripe customer if doesn't exist
    let stripeCustomer;
    const existingSubscription = await Subscription.findOne({ where: { userId: user.id } });
    
    if (existingSubscription) {
      stripeCustomer = await stripe.customers.retrieve(existingSubscription.stripeCustomerId);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Save or update subscription in database
    await Subscription.upsert({
      userId: user.id,
      stripeCustomerId: stripeCustomer.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscription status
router.get('/status', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.json({ isPremium: false });
    }

    // Check if subscription is still active
    const now = new Date();
    const isActive = subscription.status === 'active' && subscription.currentPeriodEnd > now;

    // Update user premium status if needed
    if (req.user.isPremium !== isActive) {
      await req.user.update({ isPremium: isActive });
    }

    res.json({
      isPremium: isActive,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Cancel the subscription at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ message: 'Subscription will be cancelled at the end of the current period' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;