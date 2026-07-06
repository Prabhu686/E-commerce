const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192';

const SYSTEM_PROMPT = `You are NexaBot, a friendly and helpful AI shopping assistant for NexaShop — a modern e-commerce platform.

NexaShop sells: Electronics, Fashion, Sports, Home, Beauty, Books.
Special features: Mood-based shopping, Flash Deals, Spin-to-Win wheel, Loyalty points (Bronze→Silver→Gold→Platinum).
Loyalty: 1 point per $1 spent. Silver=500pts, Gold=2000pts, Platinum=5000pts.
Free shipping on orders over $100.
30-day returns. Coupons: SPIN5(5%), SPIN10(10%), SPIN15(15%), SPIN20(20%), FREESHIP(free shipping).

Rules:
- Keep replies short, friendly, and helpful (2-4 sentences max)
- Use emojis naturally
- If asked about a product, suggest checking the relevant category
- Never make up prices or product details
- If unsure, guide user to browse or search`;

const chat = async (messages) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    max_tokens: 200,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content || 'Sorry, I could not process that.';
};

const getMoodRecommendations = async (mood, products) => {
  const productList = products.map(p => `${p.name} ($${p.price}) - ${p.category}`).join('\n');
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{
      role: 'user',
      content: `A shopper is feeling "${mood}". From these products, pick the top 3 most fitting and explain why in one short sentence each:\n${productList}\n\nFormat: ProductName: reason`,
    }],
    max_tokens: 200,
    temperature: 0.8,
  });
  return completion.choices[0]?.message?.content || '';
};

const getSearchSuggestions = async (query) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{
      role: 'user',
      content: `Generate 5 short e-commerce search suggestions related to "${query}". Return only a JSON array of strings. Example: ["suggestion1","suggestion2"]`,
    }],
    max_tokens: 100,
    temperature: 0.5,
  });
  try {
    const text = completion.choices[0]?.message?.content || '[]';
    const match = text.match(/\[.*\]/s);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
};

const getProductInsight = async (product) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{
      role: 'user',
      content: `Write a compelling 2-sentence sales insight for this product: "${product.name}" priced at $${product.price} in the ${product.category} category. Make it exciting and persuasive.`,
    }],
    max_tokens: 100,
    temperature: 0.8,
  });
  return completion.choices[0]?.message?.content || '';
};

module.exports = { chat, getMoodRecommendations, getSearchSuggestions, getProductInsight };
