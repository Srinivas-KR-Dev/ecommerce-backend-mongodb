import mongoose from "mongoose";

const deliveryOptionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    deliveryDays: {
      type: Number,
      required: true,
      min: 1,
    },
    priceCents: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    versionKey: false,
  },
);

export default mongoose.model("DeliveryOption", deliveryOptionSchema);
