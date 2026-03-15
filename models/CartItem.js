import mongoose from "mongoose";
import { randomUUID } from "crypto";

const cartItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: randomUUID,
      required: true,
      unique: true,
    },
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    deliveryOptionId: {
      type: String,
      required: true,
      default: "1",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("CartItem", cartItemSchema);
