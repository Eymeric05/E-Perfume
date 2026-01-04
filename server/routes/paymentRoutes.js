const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');
const dotenv = require('dotenv');
const { protect } = require('../middleware/authMiddleware');

dotenv.config();
const stripe = process.env.STRIPE_SECRET_KEY 
    ? Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

// Configuration PayPal
// Note: Dans Render, la variable s'appelle PAYPAL_SECRET (pas PAYPAL_CLIENT_SECRET)
const paypalClientId = process.env.PAYPAL_CLIENT_ID || 'AaHD6tvQUQe95QIEtFDVxerfNCbLVSwAtpmXtSFpGbiIQ6k2eDFLWYxkvDDqf-bQcfaxds1q8WKgR0Fe';
const paypalClientSecret = process.env.PAYPAL_SECRET || process.env.PAYPAL_CLIENT_SECRET || 'ECMXY0l9OxNUx9738m4yEM2iS5NoXcF7zV2cwpAVBGHU2Q-xvMbwfW8loE0cQDuqZ3kEZo3xw-oDiEqa';
const paypalEnvironment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'; // 'sandbox' ou 'live'

// Créer un environnement PayPal
function paypalClient() {
    const environment = paypalEnvironment === 'live' 
        ? new paypal.core.LiveEnvironment(paypalClientId, paypalClientSecret)
        : new paypal.core.SandboxEnvironment(paypalClientId, paypalClientSecret);
    
    return new paypal.core.PayPalHttpClient(environment);
}

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

// Route webhook pour Stripe
// IMPORTANT: Cette route doit être montée AVANT express.json() dans index.js
// car Stripe envoie le body brut pour la vérification de signature
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe) {
        return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gérer l'événement checkout.session.completed
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        if (orderId) {
            const Order = require('../models/Order');
            const order = await Order.findById(orderId);
            
            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: session.id,
                    status: session.payment_status,
                    update_time: new Date().toISOString(),
                    email_address: session.customer_details?.email,
                };
                await order.save();
                console.log(`Order ${orderId} marked as paid via webhook`);
            }
        }
    }

    res.json({ received: true });
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

// ============ ROUTES PAYPAL ============

// Route pour créer une commande PayPal
router.post('/paypal/create-order', protect, async (req, res) => {
    const { items, orderId } = req.body;
    const Order = require('../models/Order');

    try {
        // Récupérer la commande depuis la base de données pour utiliser les montants réels
        const dbOrder = await Order.findById(orderId);
        if (!dbOrder) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        const client = paypalClient();
        const request = new paypal.orders.OrdersCreateRequest();

        // Utiliser les montants de la commande stockée dans la DB
        // Calculer itemsTotal depuis les orderItems si itemsPrice n'existe pas
        const itemsTotal = dbOrder.itemsPrice || dbOrder.orderItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseInt(item.qty || 0)), 0);
        const tax = dbOrder.taxPrice || 0;
        const shipping = dbOrder.shippingPrice || 0;
        const total = dbOrder.totalPrice || (itemsTotal + tax + shipping);

        // Vérifier que les items ont bien des prix
        const validItems = items.filter(item => item.price && parseFloat(item.price) > 0);
        if (validItems.length === 0) {
            return res.status(400).json({ error: 'Aucun article valide avec un prix trouvé' });
        }

        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: orderId.toString(),
                description: 'Commande E-Parfume',
                custom_id: orderId.toString(),
                amount: {
                    currency_code: 'EUR',
                    value: parseFloat(total).toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: 'EUR',
                            value: parseFloat(itemsTotal).toFixed(2)
                        },
                        tax_total: {
                            currency_code: 'EUR',
                            value: parseFloat(tax).toFixed(2)
                        },
                        shipping: {
                            currency_code: 'EUR',
                            value: parseFloat(shipping).toFixed(2)
                        }
                    }
                },
                items: validItems.map(item => ({
                    name: item.name,
                    description: item.brand || '',
                    unit_amount: {
                        currency_code: 'EUR',
                        value: parseFloat(item.price).toFixed(2)
                    },
                    quantity: (item.quantity || item.qty || 1).toString()
                }))
            }],
            application_context: {
                brand_name: 'E-Parfume',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW'
            }
        });

        const paypalOrder = await client.execute(request);
        
        // Trouver l'approval URL
        const approvalUrl = paypalOrder.result.links.find(link => link.rel === 'approve')?.href;
        
        res.json({
            orderId: paypalOrder.result.id,
            approvalUrl: approvalUrl,
            status: paypalOrder.result.status
        });
    } catch (error) {
        console.error('Erreur lors de la création de la commande PayPal:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la création de la commande PayPal' });
    }
});

// Route pour capturer un paiement PayPal
router.post('/paypal/capture-order', protect, async (req, res) => {
    const { paypalOrderId, orderId } = req.body;
    const Order = require('../models/Order');

    try {
        const client = paypalClient();
        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});

        const capture = await client.execute(request);
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        // Vérifier si le paiement est réussi
        if (capture.result.status === 'COMPLETED') {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: capture.result.id,
                status: capture.result.status,
                update_time: capture.result.update_time || new Date().toISOString(),
                email_address: capture.result.payer?.email_address || ''
            };
            await order.save();

            res.json({
                success: true,
                order: order,
                capture: capture.result
            });
        } else {
            res.status(400).json({
                error: 'Le paiement PayPal n\'a pas été complété',
                status: capture.result.status
            });
        }
    } catch (error) {
        console.error('Erreur lors de la capture du paiement PayPal:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la capture du paiement PayPal' });
    }
});

// Route pour vérifier le statut d'une commande PayPal
router.post('/paypal/verify-payment', protect, async (req, res) => {
    const { paypalOrderId, orderId } = req.body;
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

        // Si on a un paypalOrderId, vérifier le statut de la commande PayPal
        if (paypalOrderId) {
            const client = paypalClient();
            const request = new paypal.orders.OrdersGetRequest(paypalOrderId);
            
            const paypalOrder = await client.execute(request);
            
            if (paypalOrder.result.status === 'COMPLETED') {
                // Mettre à jour la commande
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: paypalOrder.result.id,
                    status: paypalOrder.result.status,
                    update_time: paypalOrder.result.update_time || new Date().toISOString(),
                    email_address: paypalOrder.result.payer?.email_address || ''
                };
                await order.save();
                
                return res.json({ isPaid: true, order });
            }
        }
        
        res.json({ isPaid: false, order });
    } catch (error) {
        console.error('Erreur lors de la vérification du paiement PayPal:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
