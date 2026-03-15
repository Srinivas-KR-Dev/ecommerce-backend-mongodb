import mongoose from "mongoose";
import CartItem from "../models/CartItem.js";
import DeliveryOption from "../models/DeliveryOption.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const TAX_RATE = 0.1;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const serializeOrder = async (order, expandProducts = false) => {
  const response = {
    id: order.id,
    orderTimeMs: order.orderTimeMs,
    totalCostCents: order.totalCostCents,
    products: order.products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity,
      estimatedDeliveryTimeMs: product.estimatedDeliveryTimeMs,
    })),
  };

  if (!expandProducts) {
    return response;
  }

  const productIds = response.products.map((product) => product.productId);
  const products = await Product.find({ id: { $in: productIds } })
    .select("-_id")
    .lean();
  const productsMap = new Map(products.map((product) => [product.id, product]));

  response.products = response.products.map((product) => ({
    ...product,
    product: productsMap.get(product.productId) || null,
  }));

  return response;
};

const getAllOrders = async (req, res, next) => {
  try {
    const { expand } = req.query;
    const orders = await Order.find()
      .sort({ orderTimeMs: -1 })
      .select("-_id")
      .lean();

    const serializedOrders = await Promise.all(
      orders.map((order) => serializeOrder(order, expand === "products")),
    );

    res.status(200).json(serializedOrders);
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const cartItems = await CartItem.find().select("-_id").lean();

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const productIds = cartItems.map((item) => item.productId);
    const deliveryOptionIds = cartItems.map((item) => item.deliveryOptionId);
    const [products, deliveryOptions] = await Promise.all([
      Product.find({ id: { $in: productIds } }).select("-_id").lean(),
      DeliveryOption.find({ id: { $in: deliveryOptionIds } })
        .select("-_id")
        .lean(),
    ]);

    const productsMap = new Map(products.map((product) => [product.id, product]));
    const deliveryOptionsMap = new Map(
      deliveryOptions.map((option) => [option.id, option]),
    );

    const orderTimeMs = Date.now();

    let totalCostCents = 0;

    const orderProducts = cartItems.map((item) => {
      const product = productsMap.get(item.productId);
      const deliveryOption = deliveryOptionsMap.get(item.deliveryOptionId);

      if (!product || !deliveryOption) {
        throw new Error("Cart contains invalid product or delivery option");
      }

      const productCost = product.priceCents * item.quantity;
      const shippingCost = deliveryOption.priceCents;

      totalCostCents += productCost + shippingCost;

      return {
        productId: item.productId,
        quantity: item.quantity,
        estimatedDeliveryTimeMs: orderTimeMs + deliveryOption.deliveryDays * MS_PER_DAY,
      };
    });

    totalCostCents = Math.round(totalCostCents * (1 + TAX_RATE));

    const session = await mongoose.startSession();
    let order;

    try {
      session.startTransaction();

      const createdOrders = await Order.create(
        [
          {
            orderTimeMs,
            totalCostCents,
            products: orderProducts,
          },
        ],
        { session },
      );

      order = createdOrders[0];

      await CartItem.deleteMany({}, { session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    res.status(201).json({
      id: order.id,
      orderTimeMs: order.orderTimeMs,
      totalCostCents: order.totalCostCents,
      products: order.products.map((orderProduct) => ({
        productId: orderProduct.productId,
        quantity: orderProduct.quantity,
        estimatedDeliveryTimeMs: orderProduct.estimatedDeliveryTimeMs,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { expand } = req.query;

    const order = await Order.findOne({ id: orderId }).select("-_id").lean();

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const serializedOrder = await serializeOrder(order, expand === "products");

    res.status(200).json(serializedOrder);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllOrders,
  createOrder,
  getOrderById,
};
