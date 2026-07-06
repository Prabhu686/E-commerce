const { chat, getMoodRecommendations, getSearchSuggestions, getProductInsight } = require('../services/groqService');
const Product = require('../models/Product');

const chatWithBot = async (req, res) => {
  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ message: 'Messages required' });
  try {
    const reply = await chat(messages);
    res.json({ reply });
  } catch (err) {
    console.error('Groq chat error:', err.message);
    res.status(500).json({ message: 'AI service error', reply: 'Sorry, I am having trouble right now. Please try again!' });
  }
};

const moodRecommendations = async (req, res) => {
  const { mood } = req.params;
  try {
    const products = await Product.find(
      mood !== 'all' ? { moods: { $in: [mood] } } : {}
    ).limit(10);
    if (!products.length) return res.json({ insight: '', products: [] });
    const insight = await getMoodRecommendations(mood, products);
    res.json({ insight, products });
  } catch (err) {
    console.error('Groq mood error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

const searchSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ suggestions: [] });
  try {
    const suggestions = await getSearchSuggestions(q);
    res.json({ suggestions });
  } catch (err) {
    console.error('Groq suggestions error:', err.message);
    res.json({ suggestions: [] });
  }
};

const productInsight = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const insight = await getProductInsight(product);
    res.json({ insight });
  } catch (err) {
    console.error('Groq insight error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

module.exports = { chatWithBot, moodRecommendations, searchSuggestions, productInsight };
