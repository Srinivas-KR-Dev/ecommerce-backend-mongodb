import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from './middleware/logEvents.js';
import errorHandler from './middleware/errorHandler.js';
import connectDB from './config/dbConn.js';
import productRoutes from './routes/api/products.js';
import deliveryRoute from './routes/api/deliveryOptions.js';
import cartItemRoutes from './routes/api/cartItems.js';
import orderRoutes from './routes/api/orders.js';
import paymentSummaryRoutes from './routes/api/paymentSummary.js';
import root from './routes/root.js';
import resetRoutes from './routes/api/reset.js';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 7000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Connect to MongoDB
connectDB();

//custom middleware logger
app.use(logger);

//cross-Origin Resource Sharing
app.use(cors());

//built in middleware for json
app.use(express.json());

//serve static files
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, 'dist')));

//routes
app.use('/', root);

app.use('/api/products', productRoutes);
app.use('/api/delivery-options', deliveryRoute);
app.use('/api/cart-items', cartItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment-summary', paymentSummaryRoutes);
app.use('/api/reset', resetRoutes);

//route error handling for undefined routes
app.all(/.*/, (req, res) => {
  res.status(404);
  console.warn(
    `[${new Date().toISOString()}] 404: ${req.method} ${req.originalUrl}`,
  );
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 not found' });
  } else {
    res.type('txt').send('404 not found');
  }
});

//custom error handling
app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
