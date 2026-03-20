# Ecommerce Backend API

This project is the backend REST API for a React e-commerce application, built with Node.js, Express, MongoDB, and Mongoose. The database is hosted on MongoDB Atlas.

## Tech Stack

- Node.js with ES modules
- Express.js
- MongoDB Atlas
- Mongoose
- ESLint
- Nodemon
- CORS
- dotenv

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your MongoDB Atlas URI to .env

# Run development server
npm run dev

# Seed sample data
npm run seed:products
npm run seed:delivery-options
npm run seed:cart-items
```

## Environment Variables

```env
NODE_ENV=development
DATABASE_URI=your_mongodb_connection_string
PORT=7000
```

## API Base URL

```txt
http://localhost:7000/api
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/products` | Get all products, supports `?search=keyword` |
| GET | `/api/delivery-options` | Get delivery options |
| GET | `/api/cart-items` | Get cart items |
| POST | `/api/cart-items` | Add a cart item |
| PUT | `/api/cart-items/:productId` | Update a cart item |
| DELETE | `/api/cart-items/:productId` | Delete a cart item |
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders/:orderId` | Get one order |
| GET | `/api/payment-summary` | Get payment summary |
| POST | `/api/reset` | Reset products and delivery options |

## Example Request

**Request**

```txt
GET /api/products?search=shirt
```

**Response**

```json
[
  {
    "id": "83d4ca15-0f35-48f5-b7a3-1ea210004f2e",
    "image": "images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg",
    "name": "Adults Plain Cotton T-Shirt - 2 Pack",
    "rating": {
      "stars": 4.5,
      "count": 56
    },
    "priceCents": 10799,
    "keywords": ["tshirts", "apparel", "mens"]
  }
]
```

## Project Structure

```txt
config/          MongoDB connection
controllers/     Business logic
data/            Default seed data
dist/            Frontend build served from /
middleware/      Request logging and error handling
models/          Mongoose schemas
public/          Static assets
routes/          API endpoints
scripts/         Database seed scripts
server.js        Entry point
zipFiles.js      Backup zip utility
```

## Available Scripts

```bash
npm start                     # Start server
npm run dev                   # Start server with nodemon
npm run lint                  # Run ESLint
npm run zip                   # Create a zip backup in /backups
npm run seed:products         # Seed products
npm run seed:delivery-options # Seed delivery options
npm run seed:cart-items       # Seed cart items
```

## Notes

- The root route `/` serves `dist/index.html` if a frontend build exists.
- Product prices in `data/products.json` are used by the product seed script.
- After changing seed data, run the related seed command again to update MongoDB.

## Related Project

Frontend application:
https://github.com/Srinivas-KR-Dev/react-ecommerce-typescript

## License

MIT - See [LICENSE](LICENSE)
