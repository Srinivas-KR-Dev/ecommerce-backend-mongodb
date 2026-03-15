import { prisma } from "../config/db.js";

const getAllCartItems = async (req, res, next) => {
  try {
    const { expand } = req.query;

    const includeOptions = {};

    if (expand === "product") {
      includeOptions.include = {
        product: true,
      };
    }

    const cartItems = await prisma.cartItem.findMany(includeOptions);
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
    const productIdValid = await prisma.product.findUnique({
      where: { id: productId },
    });

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

    const existingCartItem = await prisma.cartItem.findUnique({
      where: { productId },
      select: { quantity: true },
    });

    const totalProductQuantity = (existingCartItem?.quantity || 0) + quantity;
    //Will the total in cart exceed 10?
    if (totalProductQuantity > 10) {
      return res.status(400).json({
        message: `Cannot add ${quantity} more. Maximum 10 items allowed per product (currently in cart: ${existingCartItem?.quantity || 0})`,
      });
    }
    //Upsert: Update existing or Create new
    const newCartItem = await prisma.cartItem.upsert({
      where: { productId },
      update: { quantity: { increment: quantity } },
      create: { productId, quantity, deliveryOptionId: "1" },
    });

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

    const cartItemExists = await prisma.cartItem.findUnique({
      where: { productId },
    });

    //Check if cart item exists
    if (!cartItemExists) {
      return res
        .status(404)
        .json({ message: `Product ID ${productId} not found` });
    }

    let updateData = {};
    //Handle Delivery Option Update
    if (deliveryOptionId !== undefined) {
      const deliveryOptionIdExists = await prisma.deliveryOption.findUnique({
        where: { id: deliveryOptionId },
      });

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
        await prisma.cartItem.delete({
          where: { productId },
        });

        return res.sendStatus(204);
      }

      updateData.quantity = quantity;
    }
    //Apply all validated changes (quantity, delivery, or both) at once
    const updatedCartItem = await prisma.cartItem.update({
      where: { productId },
      data: updateData,
    });

    res.status(200).json(updatedCartItem);
  } catch (error) {
    next(error);
  }
};

const deleteCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cartItemExists = await prisma.cartItem.findUnique({
      where: { productId },
    });

    //Check if cart item exists
    if (!cartItemExists) {
      return res
        .status(404)
        .json({ message: `Product ID ${productId} not found` });
    }
    //Delete cart item
    await prisma.cartItem.delete({
      where: { productId },
    });

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
