# Ecommerce Backend API

A production-ready Node.js REST API for an ecommerce platform built with Express, MongoDB, and Mongoose.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your MongoDB URI to .env

# Run development server
npm run dev

# Seed sample data
npm run seed:products
npm run seed:delivery-options
npm run seed:cart-items
```

## Tech Stack

- **Runtime:** Node.js (ES6 Modules)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Tools:** ESLint, Nodemon, CORS, dotenv

## API Endpoints

| Method   | Endpoint                | Description                                   |
| -------- | ----------------------- | --------------------------------------------- |
| GET      | `/api/products`         | Get all products (supports `?search=keyword`) |
| GET/POST | `/api/cart-items`       | Manage shopping cart                          |
| GET/POST | `/api/orders`           | Create and manage orders                      |
| GET/POST | `/api/delivery-options` | Manage delivery methods                       |
| GET      | `/api/payment-summary`  | Get order payment details                     |
| POST     | `/api/reset`            | Reset all data to seed state                  |

## Key Features

- ✅ Search products by name and keywords
- ✅ Full CRUD operations for cart, orders, and delivery options
- ✅ Request logging and error handling middleware
- ✅ Data validation with Mongoose schemas
- ✅ CORS enabled for frontend integration
- ✅ Database seeding scripts

## Project Structure

```
├── config/          MongoDB connection
├── controllers/     Business logic
├── middleware/      Request logging & error handling
├── models/          Mongoose schemas
├── routes/          API endpoints
├── scripts/         Database seeders
└── server.js        Entry point
```

## Environment Variables

```
NODE_ENV=development
DATABASE_URI=your_mongodb_connection_string
PORT=6000
```

## Available Scripts

```bash
npm start                    # Production server
npm run dev                  # Development with auto-reload
npm run lint                 # Run ESLint
npm run seed:products        # Seed products
npm run seed:delivery-options
npm run seed:cart-items
```

## License

MIT - See [LICENSE](LICENSE) file
