import Product from '../models/Product.js';

const getAllProducts = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      filter.$or = [
        { name: searchRegex },
        { keywords: { $in: [searchRegex] } },
      ];
    }

    const products = await Product.find(filter).select('-_id').lean();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export default { getAllProducts };
