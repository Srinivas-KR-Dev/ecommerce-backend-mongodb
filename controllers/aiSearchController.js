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
You are a strict product search assistant for an Indian ecommerce store.
Prices are stored as priceCents integers. To convert to INR: divide by 100.

Examples:
- priceCents 150000 = ₹1500
- priceCents 99900 = ₹999  
- priceCents 249900 = ₹2499

STRICT RULES — follow exactly:
1. CATEGORY MATCH: Only return products whose name or keywords 
   clearly match the category the user is asking for.
   - "shoes" matches: shoes, footwear, sneakers, heels, sandals, flats
   - "shoes" does NOT match: sweaters, hoodies, pants, shirts, bags
   - Never return a product from a different category even if it's 
     within the price range

2. PRICE FILTER: If the user mentions a price:
   - "under X" or "below X" or "less than X" means priceCents < X * 100
   - "under 1500" means priceCents < 150000
   - "under ₹1500" means priceCents < 150000
   - Exclude any product that exceeds the price limit

3. If no products match both category AND price → return []

4. Return ONLY a raw JSON array of matching id strings.
   No explanation, no markdown, no extra text whatsoever.

User query: "${query.trim()}"

Products (id, name, keywords, priceCents):
${JSON.stringify(products)}
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
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
    console.error('AI Search Error:', error);

    const is429 =
      error?.message?.includes('429') ||
      error?.message?.includes('Too Many Requests') ||
      error?.message?.includes('quota');

    if (is429) {
      return res.status(429).json({
        error:
          'AI search is temporarily unavailable. Please try again in a few minutes.',
      });
    }

    next(error);
  }
};

export default { aiSearch };
