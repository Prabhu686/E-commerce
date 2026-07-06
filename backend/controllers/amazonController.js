const { searchItems, getItem, getVariations, isConfigured } = require('../services/amazonService');

const searchAmazon = async (req, res) => {
  const { q, category, page = 1 } = req.query;
  if (!q) return res.status(400).json({ message: 'Query required' });
  const results = await searchItems(q, category, Number(page));
  res.json({ results, source: 'amazon', configured: isConfigured() });
};

const getAmazonProduct = async (req, res) => {
  const item = await getItem(req.params.asin);
  if (!item) return res.status(404).json({ message: 'Product not found on Amazon' });
  res.json(item);
};

const getAmazonVariations = async (req, res) => {
  const variations = await getVariations(req.params.asin);
  res.json(variations);
};

const getApiStatus = (req, res) => {
  res.json({
    configured: isConfigured(),
    message: isConfigured()
      ? '✅ Amazon PA API connected'
      : '⚠️ Using mock data — add credentials to .env to use real Amazon API',
  });
};

module.exports = { searchAmazon, getAmazonProduct, getAmazonVariations, getApiStatus };
