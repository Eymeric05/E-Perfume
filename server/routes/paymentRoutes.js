const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const dotenv = require('dotenv');
const { protect } = require('../middleware/authMiddleware');

dotenv.config();
const stripe = process.env.STRIPE_SECRET_KEY 
    ? Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

// Route pour créer une session Stripe Checkout
router.post('/create-checkout-session', protect, async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' });
    }

    const { items, orderId } = req.body;
    const frontendUrl = process.env.FRONTEND_URL || 'https://e-perfume-gamma.vercel.app';

    try {
        // Convertir les items du panier en format Stripe line_items
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                    description: item.brand || undefined,
                },
                unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${frontendUrl}/order/${orderId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/checkout?canceled=true`,
            metadata: {
                orderId: orderId.toString(),
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Erreur lors de la création de la session Stripe:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour vérifier et mettre à jour le statut de paiement d'une commande via sessionId
router.post('/verify-payment', protect, async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' });
    }

    const { sessionId, orderId } = req.body;
    const Order = require('../models/Order');

    try {
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        // Si la commande est déjà payée, retourner le statut
        if (order.isPaid) {
            return res.json({ isPaid: true, order });
        }

        // Si on a un sessionId, vérifier le statut de la session
        if (sessionId) {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            
            if (session.payment_status === 'paid' && session.metadata.orderId === orderId.toString()) {
                // Mettre à jour la commande
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: session.id,
                    status: session.payment_status,
                    update_time: new Date().toISOString(),
                    email_address: session.customer_details?.email,
                };
                await order.save();
                
                return res.json({ isPaid: true, order });
            }
        }
        
        res.json({ isPaid: false, order });
    } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour créer un PaymentIntent (gardée pour compatibilité)
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
