const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// IMPORTANT: Webhook Stripe doit être monté AVANT express.json()
// car Stripe envoie le body brut pour la vérification de signature
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const Stripe = require('stripe');
  const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
  const Order = require('./models/Order');

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

// Middleware
app.use(express.json());

// CORS Configuration - Support multiple origins for development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Always allow localhost in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow all Vercel subdomains (*.vercel.app)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Check if origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // In production, check if origin matches FRONTEND_URL (flexible matching)
    if (process.env.FRONTEND_URL) {
      try {
        const frontendUrl = new URL(process.env.FRONTEND_URL);
        if (origin.includes(frontendUrl.hostname)) {
          return callback(null, true);
        }
      } catch (e) {
        // If FRONTEND_URL is not a valid URL, just check if origin includes it
        if (origin.includes(process.env.FRONTEND_URL)) {
          return callback(null, true);
        }
      }
    }
    
    // Default: allow in non-production, deny in production
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(morgan('dev'));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e-parfume';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('MongoDB Connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.warn('Warning: Server will start but database operations will fail.');
    console.warn('Please ensure MongoDB is running or set MONGO_URI in .env file');
  });

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const brandRoutes = require('./routes/brandRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/brands', brandRoutes);

app.get('/api/config/stripe', (req, res) =>
  res.send(process.env.STRIPE_PUBLISHABLE_KEY || '')
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
