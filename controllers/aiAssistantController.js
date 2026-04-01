import Product from '../models/Product.js';

const aiAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const searchRegex = new RegExp(message.trim(), 'i');

    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { keywords: { $in: [searchRegex] } },
      ],
    })
      .select('-_id')
      .limit(5)
      .lean();

    res.status(200).json({
      message: 'Relevant products fetched successfully.',
      products,
    });
  } catch (error) {
    next(error);
  }
};

export default { aiAssistant };
