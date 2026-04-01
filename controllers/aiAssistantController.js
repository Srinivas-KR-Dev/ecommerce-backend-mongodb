import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getProductCategory = (product) => {
  const keywords = product.keywords || [];
  const name = product.name.toLowerCase();

  if (
    keywords.some((keyword) =>
      ['shoes', 'footwear', 'sneakers', 'heels', 'sandals', 'flats'].includes(
        keyword,
      ),
    )
  ) {
    return 'Footwear';
  }

  if (
    keywords.some((keyword) =>
      ['tshirts', 'shirts', 'sweater', 'hoodie', 'pants', 'shorts', 'dress'].includes(
        keyword,
      ),
    )
  ) {
    return 'Clothing';
  }

  if (
    keywords.some((keyword) =>
      ['sunglasses', 'earrings', 'jewelry', 'accessories', 'eyewear'].includes(
        keyword,
      ),
    )
  ) {
    return 'Accessories';
  }

  if (
    keywords.some((keyword) =>
      ['kitchen', 'appliances', 'cookware', 'blender', 'kettle', 'toaster'].includes(
        keyword,
      ),
    )
  ) {
    return 'Kitchen';
  }

  if (
    keywords.some((keyword) =>
      ['bathroom', 'bedroom', 'home', 'curtains', 'towels', 'mirror', 'bathmat'].includes(
        keyword,
      ),
    )
  ) {
    return 'Home';
  }

  if (
    keywords.some((keyword) =>
      ['sports', 'basketball', 'sports equipment', 'ball'].includes(keyword),
    )
  ) {
    return 'Sports';
  }

  if (name.includes('shoe') || name.includes('sneaker')) {
    return 'Footwear';
  }

  return 'General';
};

const aiAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const escapedMessage = escapeRegex(message.trim());
    const searchRegex = new RegExp(escapedMessage, 'i');

    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { keywords: { $in: [searchRegex] } },
      ],
    })
      .select('-_id')
      .limit(5)
      .lean();

    const formattedProducts = products.map((product) => ({
      name: product.name,
      price: `₹${product.priceCents / 100}`,
      category: getProductCategory(product),
    }));

    const prompt = `
You are a helpful shopping assistant for an Indian ecommerce store.

Use the user's message and the product list below to write a short, helpful shopping response.
Recommend only from the provided products.
If no products are provided, politely say that no close matches were found.
Keep the response concise and customer-friendly.

User message: "${message.trim()}"

Products:
${JSON.stringify(formattedProducts)}
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    res.status(200).json({
      reply,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export default { aiAssistant };
