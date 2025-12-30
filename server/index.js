const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
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

app.get('/api/config/stripe', (req, res) =>
  res.send(process.env.STRIPE_PUBLISHABLE_KEY || '')
);

const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, '/uploads')));

// Error Handling
app.use(notFound);
app.use(errorHandler);


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
