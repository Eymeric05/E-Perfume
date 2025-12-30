const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config();
const stripe = process.env.STRIPE_SECRET_KEY 
    ? Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

router.post('/create-payment-intent', async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' });
    }

    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'eur',
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
