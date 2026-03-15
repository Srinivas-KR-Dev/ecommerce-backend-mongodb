import { prisma } from '../config/db.js';

const TAX_RATE = 0.1;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getAllOrders = async (req, res, next) => {
  try {
    const { expand } = req.query;

    const includeOptions = {
      include: {
        orderProducts: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        orderTimeMs: 'desc',
      },
    };

    if (expand === 'products') {
      includeOptions.include.orderProducts.include = {
        product: true,
      };
    }

    const orders = await prisma.order.findMany(includeOptions);

    res.status(200).json(
      orders.map((order) => ({
        id: order.id,
        orderTimeMs: order.orderTimeMs,
        totalCostCents: order.totalCostCents,
        products: order.orderProducts.map((orderProduct) => ({
          productId: orderProduct.productId,
          quantity: orderProduct.quantity,
          estimatedDeliveryTimeMs: orderProduct.estimatedDeliveryTimeMs,
          ...(expand === 'products' ? { product: orderProduct.product } : {}),
        })),
      }))
    );
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      include: {
        product: true,
        deliveryOption: true,
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orderTimeMs = Date.now();

    let totalCostCents = 0;

    const orderProducts = cartItems.map((item) => {
      const productCost = item.product.priceCents * item.quantity;
      const shippingCost = item.deliveryOption.priceCents;

      totalCostCents += productCost + shippingCost;

      return {
        productId: item.productId,
        quantity: item.quantity,
        estimatedDeliveryTimeMs: BigInt(
          orderTimeMs + item.deliveryOption.deliveryDays * MS_PER_DAY
        ),
      };
    });

    totalCostCents = Math.round(totalCostCents * (1 + TAX_RATE));

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderTimeMs: BigInt(orderTimeMs),
          totalCostCents,
          orderProducts: {
            create: orderProducts,
          },
        },
        include: {
          orderProducts: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      await tx.cartItem.deleteMany();

      return newOrder;
    });

    res.status(201).json({
      id: order.id,
      orderTimeMs: order.orderTimeMs,
      totalCostCents: order.totalCostCents,
      products: order.orderProducts.map((orderProduct) => ({
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

    const includeOptions = {
      where: { id: orderId },
      include: {
        orderProducts: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    };

    if (expand === 'products') {
      includeOptions.include.orderProducts.include = {
        product: true,
      };
    }

    const order = await prisma.order.findUnique(includeOptions);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({
      id: order.id,
      orderTimeMs: order.orderTimeMs,
      totalCostCents: order.totalCostCents,
      products: order.orderProducts.map((orderProduct) => ({
        productId: orderProduct.productId,
        quantity: orderProduct.quantity,
        estimatedDeliveryTimeMs: orderProduct.estimatedDeliveryTimeMs,
        ...(expand === 'products' ? { product: orderProduct.product } : {}),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllOrders,
  createOrder,
  getOrderById,
};
