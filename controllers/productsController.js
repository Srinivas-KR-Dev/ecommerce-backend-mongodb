import Product from "../models/Product.js";

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().select("-_id").lean();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export default { getAllProducts };
