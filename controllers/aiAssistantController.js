import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'best',
  'buy',
  'for',
  'from',
  'gift',
  'good',
  'hello',
  'help',
  'i',
  'ideas',
  'in',
  'is',
  'item',
  'items',
  'like',
  'looking',
  'me',
  'my',
  'need',
  'of',
  'on',
  'or',
  'please',
  'price',
  'recommend',
  'show',
  'something',
  'suggest',
  'that',
  'the',
  'to',
  'under',
  'want',
  'with',
]);

const MAX_CANDIDATE_PRODUCTS = 40;

//Maps product keywords to simple display categories for the AI prompt.
const CATEGORY_MAP = [
  [['shoes', 'footwear', 'sneakers', 'heels', 'sandals', 'flats'], 'Footwear'],
  [['tshirts', 'shirts', 'sweater', 'hoodie', 'pants', 'shorts', 'dress'], 'Clothing'],
  [['sunglasses', 'earrings', 'jewelry', 'accessories', 'eyewear'], 'Accessories'],
  [['kitchen', 'appliances', 'cookware', 'blender', 'kettle', 'toaster'], 'Kitchen'],
  [['bathroom', 'bedroom', 'home', 'curtains', 'towels', 'mirror', 'bathmat'], 'Home'],
  [['sports', 'basketball', 'ball', 'sports equipment'], 'Sports'],
];

//Converts simple plurals to singular words for easier matching.
const normalizeToken = (token) => {
  if (token.length > 3 && token.endsWith('s')) {
    return token.slice(0, -1);
  }

  return token;
};

//Finds a readable category for each product using keywords and product name.
const getProductCategory = (product) => {
  const keywords = product.keywords || [];

  for (const [keys, label] of CATEGORY_MAP) {
    if (keywords.some((keyword) => keys.includes(keyword))) {
      return label;
    }
  }

  const name = product.name.toLowerCase();

  if (name.includes('shoe') || name.includes('sneaker')) {
    return 'Footwear';
  }

  return 'General';
};

//Converts a user message or product text into useful searchable words.
const getSearchTokens = (message) =>
  message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(normalizeToken)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

//Ranks products locally before sending candidates to Gemini.
const getLocalMatches = (message, products) => {
  const tokens = getSearchTokens(message);

  if (tokens.length === 0) {
    return [];
  }

  return products
    .map((product) => {
      const productTokens = new Set(
        getSearchTokens(`${product.name} ${(product.keywords || []).join(' ')}`),
      );
      const score = tokens.reduce((total, token) => {
        return productTokens.has(token) ? total + 1 : total;
      }, 0);

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ product }) => product);
};

//Builds the grounded prompt using only selected candidate products.
const buildPrompt = (message, products) => {
  const lines = products.map(
    (product) =>
      `- id: ${product.id}\n  Name: ${product.name}\n  Price: ₹${Math.round(product.priceCents / 100)}\n  Category: ${getProductCategory(product)}\n  Keywords: ${(product.keywords || []).join(', ')}`,
  );

  return `
You are a helpful shopping assistant for an Indian ecommerce store.

Use the user's message and the candidate products below to write a concise, helpful response.

Rules:
- Recommend only from the provided products
- Keep the reply under 80 words
- If there are no close matches, say that clearly
- Return only valid JSON in this exact shape:
  {"reply":"string","matchedIds":["id1","id2"]}
- Include at most 4 matched ids

User message: "${message}"

Candidate products:
${lines.join('\n\n')}
`;
};

//Safely converts Gemini's JSON text into a usable reply and id list.
const parseAiResponse = (text) => {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    reply: typeof parsed.reply === 'string' ? parsed.reply.trim() : '',
    matchedIds: Array.isArray(parsed.matchedIds)
      ? parsed.matchedIds.filter((id) => typeof id === 'string')
      : [],
  };
};

//Chooses how many products should be sent to Gemini.
const getCandidateProducts = (allProducts, localMatches) => {
  if (localMatches.length > 0) {
    return localMatches.slice(0, 12);
  }

  if (allProducts.length <= MAX_CANDIDATE_PRODUCTS) {
    return allProducts;
  }

  return allProducts.slice(0, MAX_CANDIDATE_PRODUCTS);
};

//Builds a useful local response if Gemini fails or returns invalid JSON.
const buildFallbackResponse = (message, products) => {
  const localMatches = getLocalMatches(message, products).slice(0, 4);

  if (localMatches.length === 0) {
    return {
      reply:
        'I could not find close matches right now. Try a more specific prompt like "running shoes under 1500" or "gift for kitchen".',
      products: [],
    };
  }

  return {
    reply:
      'AI recommendations are temporarily limited right now, but I found a few relevant products you can still explore below.',
    products: localMatches,
  };
};

const aiAssistant = async (req, res, next) => {
  //Read and validate the user's chat message.
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  let candidateProducts = [];

  try {
    //Fetch products and rank the most relevant candidates locally.
    const allProducts = await Product.find({}).select('-_id').lean();
    const localMatches = getLocalMatches(message.trim(), allProducts);
    candidateProducts = getCandidateProducts(allProducts, localMatches);

    //Send the user message and grounded product context to Gemini.
    const prompt = buildPrompt(message.trim(), candidateProducts);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    let aiResponse;

    //Parse Gemini's structured response or use local fallback.
    try {
      aiResponse = parseAiResponse(text);
    } catch {
      console.warn('AI Assistant returned non-JSON response, using local fallback.');
      const fallback = buildFallbackResponse(message.trim(), candidateProducts);
      return res.status(200).json(fallback);
    }

    //Map Gemini-selected ids back to real MongoDB products.
    const productsById = new Map(candidateProducts.map((product) => [product.id, product]));
    const matchedProducts = aiResponse.matchedIds
      .map((id) => productsById.get(id))
      .filter(Boolean)
      .slice(0, 4);

    //Return the assistant reply with matched catalog products.
    return res.status(200).json({
      reply:
        aiResponse.reply ||
        (matchedProducts.length > 0
          ? 'Here are a few good options based on your request.'
          : 'I could not find close matches for that request.'),
      products: matchedProducts,
    });
  } catch (error) {
    console.error('AI Assistant Error:', error);

    //If Gemini fails after candidates are ready, return local fallback.
    if (candidateProducts.length > 0) {
      return res.status(200).json(
        buildFallbackResponse(message.trim(), candidateProducts),
      );
    }

    next(error);
  }
};

export default { aiAssistant };
