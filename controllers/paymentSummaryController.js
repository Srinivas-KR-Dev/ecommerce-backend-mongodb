import { prisma } from '../config/db.js';

const getPaymentSummary = async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      include: {
        product: true,
        deliveryOption: true,
      },
    });

    let totalItems = 0;
    let productCostCents = 0;
    let shippingCostCents = 0;

    for (const item of cartItems) {
      totalItems += item.quantity;
      productCostCents += item.product.priceCents * item.quantity;
      shippingCostCents += item.deliveryOption.priceCents;
    }

    const totalCostBeforeTaxCents = productCostCents + shippingCostCents;
    const taxCents = Math.round(totalCostBeforeTaxCents * 0.1);
    const totalCostCents = totalCostBeforeTaxCents + taxCents;

    res.status(200).json({
      totalItems,
      productCostCents,
      shippingCostCents,
      totalCostBeforeTaxCents,
      taxCents,
      totalCostCents,
    });
  } catch (error) {
    next(error);
  }
};

export default { getPaymentSummary };
