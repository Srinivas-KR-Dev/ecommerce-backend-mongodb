# Ecommerce Backend API

A Node.js Express server for an ecommerce platform with MongoDB integration. This backend provides REST API endpoints for managing products, cart items, orders, delivery options, and payment summaries.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Technologies Used](#technologies-used)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ecomm-backend-MongoDB
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy .env.example to .env
   cp .env.example .env

   # Edit .env with your MongoDB credentials
   ```

4. **Start the server**

   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

5. **Seed initial data (optional)**
   ```bash
   npm run seed:products
   npm run seed:delivery-options
   npm run seed:cart-items
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/EcommerceDB?retryWrites=true&w=majority
PORT=6000
```

### Variable Descriptions

| Variable       | Description               | Default     |
| -------------- | ------------------------- | ----------- |
| `NODE_ENV`     | Environment mode          | development |
| `DATABASE_URI` | MongoDB connection string | Required    |
| `PORT`         | Server port               | 6000        |

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server with nodemon (auto-reload)
- `npm run lint` - Run ESLint to check code quality
- `npm run seed:products` - Seed products to MongoDB
- `npm run seed:delivery-options` - Seed delivery options to MongoDB
- `npm run seed:cart-items` - Seed cart items to MongoDB

## Project Structure

```
ecomm-backend-MongoDB/
├── config/              # Database configuration
│   └── dbConn.js       # MongoDB connection setup
├── controllers/         # Route controllers
│   ├── productsController.js
│   ├── cartItemsController.js
│   ├── ordersController.js
│   ├── deliveryOptionsController.js
│   ├── paymentSummaryController.js
│   └── resetController.js
├── middleware/          # Custom middleware
│   ├── errorHandler.js
│   └── logEvents.js
├── models/              # Mongoose schemas
│   ├── Product.js
│   ├── CartItem.js
│   ├── Order.js
│   └── DeliveryOption.js
├── routes/              # API routes
│   └── api/
│       ├── products.js
│       ├── cartItems.js
│       ├── orders.js
│       ├── deliveryOptions.js
│       ├── paymentSummary.js
│       └── reset.js
├── scripts/             # Seed scripts
│   ├── seedProducts.js
│   ├── seedDeliveryOptions.js
│   └── seedCartItems.js
├── public/              # Static files
│   ├── css/
│   └── images/
├── data/                # Sample JSON data
│   ├── products.json
│   ├── deliveryOptions.json
│   ├── orders.json
│   └── cart.json
├── logs/                # Application logs
├── server.js            # Main server file
├── package.json         # Dependencies
├── eslint.config.js     # ESLint configuration
└── .env.example         # Environment variables template
```

## API Endpoints

### Products

- `GET /api/products` - Get all products (supports search query)
  - Query: `?search=keyword` - Filter products by name or keywords

### Cart Items

- `GET /api/cart-items` - Get all cart items
- `POST /api/cart-items` - Add item to cart
- `PATCH /api/cart-items/:id` - Update cart item quantity
- `DELETE /api/cart-items/:id` - Remove item from cart

### Delivery Options

- `GET /api/delivery-options` - Get all delivery options
- `POST /api/delivery-options` - Create new delivery option
- `PATCH /api/delivery-options/:id` - Update delivery option
- `DELETE /api/delivery-options/:id` - Delete delivery option

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Payment Summary

- `GET /api/payment-summary` - Get payment summary

### Reset

- `POST /api/reset` - Reset all data to initial state

## Features

- ✅ Express.js REST API
- ✅ MongoDB with Mongoose ODM
- ✅ CORS support for frontend integration
- ✅ Request logging middleware
- ✅ Error handling middleware
- ✅ Product search functionality
- ✅ Cart management
- ✅ Order management
- ✅ Delivery options configuration
- ✅ Data seeding scripts
- ✅ ESLint code quality checks

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development auto-reload
- **ESLint** - Code linting
- **Day.js** - Date/time utilities
- **dotenv** - Environment variable management

## Error Handling

The application includes comprehensive error handling middleware that logs errors and returns appropriate HTTP status codes. Check the `logs/requestLog.txt` file for detailed request and error logs.

## Getting Help

For issues or questions:

1. Check the error logs in `logs/` directory
2. Verify `.env` configuration
3. Ensure MongoDB connection is active
4. Review API endpoint documentation above

## License

MIT License - See [LICENSE](LICENSE) file for details

## Author

Srinivas KR
