# E-Commerce Backend (Prisma + PostgreSQL)

Simple RESTful backend for a beginner e-commerce project built with Express, Prisma ORM, and PostgreSQL.

The API supports products, delivery options, shopping cart management, checkout, and order history.

## Tech Stack

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- ESLint

## Features

- Products API
- Delivery options API
- Cart items API
- Orders API
- Payment summary API
- Reset API for development
- Prisma schema and migrations

## Project Structure

```text
controllers/      API controllers
routes/api/       Express route definitions
middleware/       Logger and error handling middleware
config/           Database configuration
prisma/           Prisma schema, migrations, seed script
data/             Default seed data
public/           Static assets
views/            HTML views (404 page)
server.js         Application entry point
```

## Requirements

- Node.js
- PostgreSQL

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db?schema=public"
```

## Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Seed default products, delivery options, and cart items:

```bash
node prisma/seed.js
```

## Run The Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Server default:

```text
http://localhost:5000
```

## API Endpoints

### Products

`GET /api/products`

Returns all products.

### Delivery Options

`GET /api/delivery-options`

Returns all delivery options.

Optional query:

- `expand=estimatedDeliveryTime`

When used, each delivery option also includes:

- `estimatedDeliveryTimeMs`

### Cart Items

`GET /api/cart-items`

Optional query:

- `expand=product`

`POST /api/cart-items`

Request body:

```json
{
  "productId": "product-id",
  "quantity": 1
}
```

`PUT /api/cart-items/:productId`

Request body:

```json
{
  "quantity": 2,
  "deliveryOptionId": "1"
}
```

`DELETE /api/cart-items/:productId`

### Orders

`GET /api/orders`

Optional query:

- `expand=products`

`POST /api/orders`

Creates an order from current cart items, calculates shipping and tax, and clears the cart.

`GET /api/orders/:orderId`

Optional query:

- `expand=products`

### Payment Summary

`GET /api/payment-summary`

Returns:

- `totalItems`
- `productCostCents`
- `shippingCostCents`
- `totalCostBeforeTaxCents`
- `taxCents`
- `totalCostCents`

Example response:

```json
{
  "totalItems": 3,
  "productCostCents": 3000,
  "shippingCostCents": 499,
  "totalCostBeforeTaxCents": 3499,
  "taxCents": 350,
  "totalCostCents": 3849
}
```

### Reset

`POST /api/reset`

Development-only endpoint.

Behavior:

- clears orders, order products, cart items, products, and delivery options
- reloads default products
- reloads default delivery options

If `NODE_ENV` is not `development`, this endpoint returns `403 Forbidden`.

## Prisma Models

This project currently uses these models:

- `Product`
- `DeliveryOption`
- `CartItem`
- `Order`
- `OrderProduct`

## Useful Commands

```bash
npm run dev
npm start
npm run lint
npx prisma migrate dev
node prisma/seed.js
```

## Notes

- `orderTimeMs` and `estimatedDeliveryTimeMs` are stored as `BigInt`.
- `server.js` converts `BigInt` to JSON numbers before API responses are sent.
- Static files are served from `public/`.
- Unknown routes return `views/404.html` for browser requests.

## Learning Goal

This backend is intentionally kept simple and beginner-friendly.
The focus is understanding:

- REST APIs with Express
- Prisma models and relations
- PostgreSQL integration
- controller and route structure
- simple cart and order flow
