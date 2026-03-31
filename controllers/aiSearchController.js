import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';

const aiSearch = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query?.trim()) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const products = await Product.find({})
      .select('id name keywords priceCents -_id')
      .lean();

    const prompt = `
      You are a product search assistant for an Indian ecommerce store.
      Prices are in priceCents (divide by 100 to get INR rupees).
      
      Given the user query and product list below, return ONLY a valid 
      JSON array of product id strings that best match the query.
      
      Rules:
      - Match by name, keywords, and price range if mentioned
      - If user says "under ₹500" match products where priceCents < 50000
      - Return empty array [] if nothing matches
      - Return ONLY the raw JSON array, no explanation, no markdown
      
      User query: "${query.trim()}"
      
      Products:
      ${JSON.stringify(products)}
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let matchedIds;

    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      matchedIds = JSON.parse(cleaned);

      if (!Array.isArray(matchedIds)) {
        return res.status(500).json({ error: 'Unexpected AI response format' });
      }
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    if (matchedIds.length === 0) {
      return res.status(200).json([]);
    }

    const matchedProducts = await Product.find({
      id: { $in: matchedIds },
    })
      .select('-_id')
      .lean();

    res.status(200).json(matchedProducts);
  } catch (error) {
    next(error);
  }
};

export default { aiSearch };
