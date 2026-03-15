import mongoose from "mongoose";
import { randomUUID } from "crypto";

const ratingSchema = new mongoose.Schema(
  {
    stars: {
      type: Number,
      default: null,
    },
    count: {
      type: Number,
      default: null,
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: randomUUID,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: ratingSchema,
      default: () => ({
        stars: null,
        count: null,
      }),
    },
    priceCents: {
      type: Number,
      required: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Product", productSchema);
