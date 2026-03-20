# Ecommerce Backend API (React e-commerce)

This project is the **backend REST API for a React e-commerce application**, built with Node.js, Express, MongoDB, and Mongoose. The database is hosted using **MongoDB Atlas**.

It also serves the frontend `index.html` from the root route when a built frontend exists in `dist/`.

## Project Overview

The API provides backend services for:

- product catalog search
- shopping cart management
- checkout and payment summary calculation
- order creation and order history

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Tools:** ESLint, Nodemon, CORS, dotenv

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
# Create .env from .env.example
# Add your MongoDB Atlas connection string to .env

# Seed sample data
npm run seed:products
npm run seed:delivery-options
npm run seed:cart-items

# Run development server
npm run dev
```

## API Base URL

```text
http://localhost:7000/api
```

Frontend root:

```text
http://localhost:7000/
```

## API Endpoints

| Method       | Endpoint                     | Description                                   |
| ------------ | ---------------------------- | --------------------------------------------- |
| `GET`        | `/api/products`              | Get all products (supports `?search=keyword`) |
| `GET`        | `/api/delivery-options`      | Get available delivery methods                |
| `GET/POST`   | `/api/cart-items`            | Get cart items or add an item                 |
| `PUT/DELETE` | `/api/cart-items/:productId` | Update or remove a cart item                  |
| `GET/POST`   | `/api/orders`                | Create and manage orders                      |
| `GET`        | `/api/orders/:orderId`       | Get a single order                            |
| `GET`        | `/api/payment-summary`       | Get order payment details                     |
| `POST`       | `/api/reset`                 | Reset all data to seed state in development   |

## Root Route

`GET /`

If `dist/index.html` exists, the server returns that file.

Supported root paths:

- `/`
- `/index`
- `/index.html`

If the file does not exist, the route returns a `404`.

## Example Request WITH RESPONSE

**Request:**

```http
GET /api/products?search=shirt
```

**Response:**

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

```text
├── config/          MongoDB and Mongoose connection setup
├── controllers/     Business logic
├── middleware/      Request logging and error handling
├── models/          Mongoose schemas
├── routes/          API endpoints and root route
├── scripts/         Seed scripts
├── data/            Seed data
└── server.js        Entry point
```

## Environment Variables

```env
NODE_ENV=development
DATABASE_URI=your_mongodb_atlas_connection_string
PORT=7000
```

## Available Scripts

```bash
npm start                      # Production server
npm run dev                    # Development with auto-reload
npm run lint                   # Run ESLint
npm run seed:products          # Seed products
npm run seed:delivery-options  # Seed delivery options
npm run seed:cart-items        # Seed cart items
npm run zip                    # Create backup zip
```

## Static Files And 404 Handling

- Static files are served from `public/`
- Static files are also served from `dist/`
- Unknown browser routes return `views/404.html`
- Unknown API routes return JSON: `{ "error": "404 not found" }`

## Related Project

Frontend application:
https://github.com/Srinivas-KR-Dev/react-ecommerce-typescript

## Architecture Diagram

```mermaid
flowchart LR
    A[React Frontend] -->|HTTP requests| B[Express REST API]
    B --> C[Controllers]
    C --> D[Mongoose ODM]
    D --> E[(MongoDB Atlas)]
```

## License

MIT - See [LICENSE](LICENSE) file
