import CartItem from '../models/CartItem.js';
import DeliveryOption from '../models/DeliveryOption.js';
import Product from '../models/Product.js';

const getPaymentSummary = async (req, res, next) => {
  try {
    const cartItems = await CartItem.find().select('-_id').lean();
    const productIds = cartItems.map((item) => item.productId);
    const deliveryOptionIds = cartItems.map((item) => item.deliveryOptionId);

    const [products, deliveryOptions] = await Promise.all([
      Product.find({ id: { $in: productIds } }).select('-_id').lean(),
      DeliveryOption.find({ id: { $in: deliveryOptionIds } })
        .select('-_id')
        .lean(),
    ]);

    const productsMap = new Map(products.map((product) => [product.id, product]));
    const deliveryOptionsMap = new Map(
      deliveryOptions.map((option) => [option.id, option]),
    );

    let totalItems = 0;
    let productCostCents = 0;
    let shippingCostCents = 0;

    for (const item of cartItems) {
      const product = productsMap.get(item.productId);
      const deliveryOption = deliveryOptionsMap.get(item.deliveryOptionId);

      if (!product || !deliveryOption) {
        continue;
      }

      totalItems += item.quantity;
      productCostCents += product.priceCents * item.quantity;
      shippingCostCents += deliveryOption.priceCents;
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
