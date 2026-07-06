const Product = require('../models/Product');

const LIST_FIELDS = 'name price originalPrice images category moods stock sold rating numReviews isFlashDeal flashDealEnds isTrending isFeatured tags';

const getProducts = async (req, res) => {
  const { category, mood, search, sort, page = 1, limit = 12, flash } = req.query;
  const query = {};

  if (category && category !== 'all') query.category = category;
  if (mood && mood !== 'all') query.moods = { $in: [mood] };
  if (flash === 'true') { query.isFlashDeal = true; query.flashDealEnds = { $gt: new Date() }; }
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { tags: { $in: [new RegExp(search, 'i')] } },
    { category: { $regex: search, $options: 'i' } },
  ];

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    popular: { sold: -1 },
  };

  const [products, total] = await Promise.all([
    Product.find(query)
      .select(LIST_FIELDS)
      .sort(sortMap[sort] || { isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(query),
  ]);

  res.json({ products, total, pages: Math.ceil(total / limit) });
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('reviews.user', 'name')
    .lean();
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

const getRecommendations = async (req, res) => {
  const product = await Product.findById(req.params.id).select('category moods').lean();
  if (!product) return res.status(404).json([]);
  const recs = await Product.find({
    _id: { $ne: product._id },
    $or: [{ category: product.category }, { moods: { $in: product.moods } }],
  }).select(LIST_FIELDS).limit(4).lean();
  res.json(recs);
};

const getTrending = async (req, res) => {
  const products = await Product.find({ isTrending: true })
    .select('name price images _id')
    .sort({ sold: -1 })
    .limit(10)
    .lean();
  res.json(products);
};

const createProduct = async (req, res) => {
  const product = await Product.create({ ...req.body, priceHistory: [{ price: req.body.price }] });
  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  if (req.body.price && req.body.price !== product.price)
    product.priceHistory.push({ price: req.body.price });
  Object.assign(product, req.body);
  await product.save();
  res.json(product);
};

const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

const addReview = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  const already = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (already) return res.status(400).json({ message: 'Already reviewed' });
  product.reviews.push({ user: req.user._id, name: req.user.name, ...req.body });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((a, r) => a + r.rating, 0) / product.numReviews;
  await product.save();
  res.status(201).json({ message: 'Review added' });
};

module.exports = { getProducts, getProductById, getRecommendations, getTrending, createProduct, updateProduct, deleteProduct, addReview };
