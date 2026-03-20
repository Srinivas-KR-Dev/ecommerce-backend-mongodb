import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: randomUUID,
      required: true,
      unique: true,
      trim: true,
    },
    orderTimeMs: {
      type: Number,
      required: true,
    },
    totalCostCents: {
      type: Number,
      required: true,
    },
    products: {
      type: [
        new mongoose.Schema(
          {
            productId: {
              type: String,
              required: true,
              trim: true,
            },
            quantity: {
              type: Number,
              required: true,
              min: 1,
            },
            estimatedDeliveryTimeMs: {
              type: Number,
              required: true,
            },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('Order', orderSchema);
