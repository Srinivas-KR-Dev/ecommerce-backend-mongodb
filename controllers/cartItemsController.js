import CartItem from "../models/CartItem.js";
import DeliveryOption from "../models/DeliveryOption.js";
import Product from "../models/Product.js";

const attachProductsToCartItems = async (cartItems) => {
  const productIds = cartItems.map((item) => item.productId);
  const products = await Product.find({ id: { $in: productIds } })
    .select("-_id")
    .lean();

  const productsMap = new Map(products.map((product) => [product.id, product]));

  return cartItems.map((item) => ({
    ...item,
    product: productsMap.get(item.productId) || null,
  }));
};

const getAllCartItems = async (req, res, next) => {
  try {
    const { expand } = req.query;
    const cartItems = await CartItem.find()
      .sort({ createdAt: 1 })
      .select("-_id -createdAt -updatedAt")
      .lean();

    if (expand === "product") {
      const cartItemsWithProducts = await attachProductsToCartItems(cartItems);
      return res.status(200).json(cartItemsWithProducts);
    }

    res.status(200).json(cartItems);
  } catch (error) {
    next(error);
  }
};

const createCartItem = async (req, res, next) => {
  try {
    //DATA EXTRACTION & INITIAL VALIDATION
    if (!req.body?.productId || !req.body?.quantity) {
      return res
        .status(400)
        .json({ message: "productId and quantity are required" });
    }

    const { productId, quantity: rawQuantity } = req.body;
    const quantity = Number(rawQuantity);

    //Does the product exist in the catalog?
    const productIdValid = await Product.findOne({ id: productId }).lean();

    if (!productIdValid) {
      return res
        .status(400)
        .json({ message: `Product ID ${productId} is invalid` });
    }
    //INPUT RANGE VALIDATION (Is the single addition within 1-10?)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res
        .status(400)
        .json({ message: "Quantity should be a number between 1 and 10" });
    }

    const existingCartItem = await CartItem.findOne({ productId })
      .select("quantity -_id")
      .lean();

    const totalProductQuantity = (existingCartItem?.quantity || 0) + quantity;
    //Will the total in cart exceed 10?
    if (totalProductQuantity > 10) {
      return res.status(400).json({
        message: `Cannot add ${quantity} more. Maximum 10 items allowed per product (currently in cart: ${existingCartItem?.quantity || 0})`,
      });
    }
    //Upsert: Update existing or Create new
    const newCartItem = await CartItem.findOneAndUpdate(
      { productId },
      {
        $inc: { quantity },
        $setOnInsert: { deliveryOptionId: "1" },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      },
    )
      .select("-_id -createdAt -updatedAt")
      .lean();

    res.status(201).json(newCartItem);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    // Ensure at least one field is provided for update
    if (
      req.body?.deliveryOptionId === undefined &&
      req.body?.quantity === undefined
    ) {
      return res
        .status(400)
        .json({ message: "deliveryOptionId or quantity is required" });
    }

    const { productId } = req.params;
    const { deliveryOptionId: rawdeliveryOptionId, quantity: rawQuantity } =
      req.body;

    const deliveryOptionId = rawdeliveryOptionId?.toString();

    const cartItemExists = await CartItem.findOne({ productId }).lean();

    //Check if cart item exists
    if (!cartItemExists) {
      return res
        .status(404)
        .json({ message: `Product ID ${productId} not found` });
    }

    let updateData = {};
    //Handle Delivery Option Update
    if (deliveryOptionId !== undefined) {
      const deliveryOptionIdExists = await DeliveryOption.findOne({
        id: deliveryOptionId,
      }).lean();

      if (!deliveryOptionIdExists)
        return res.status(404).json({ message: "Invalid delivery option" });

      updateData.deliveryOptionId = deliveryOptionId;
    }
    //Handle Quantity Update
    if (rawQuantity !== undefined) {
      const quantity = Number(rawQuantity);

      if (!Number.isInteger(quantity) || quantity < 0 || quantity > 10) {
        return res.status(400).json({
          message:
            "Quantity must be a number and not be greater than 10 or lesser than 0",
        });
      }

      if (quantity === 0) {
        await CartItem.deleteOne({ productId });

        return res.sendStatus(204);
      }

      updateData.quantity = quantity;
    }
    //Apply all validated changes (quantity, delivery, or both) at once
    const updatedCartItem = await CartItem.findOneAndUpdate(
      { productId },
      updateData,
      { returnDocument: "after", runValidators: true },
    )
      .select("-_id -createdAt -updatedAt")
      .lean();

    res.status(200).json(updatedCartItem);
  } catch (error) {
    next(error);
  }
};

const deleteCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cartItemExists = await CartItem.findOne({ productId }).lean();

    //Check if cart item exists
    if (!cartItemExists) {
      return res
        .status(404)
        .json({ message: `Product ID ${productId} not found` });
    }
    //Delete cart item
    await CartItem.deleteOne({ productId });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCartItems,
  createCartItem,
  updateCartItem,
  deleteCartItem,
};
