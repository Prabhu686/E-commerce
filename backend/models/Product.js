const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
}, { timestamps: true });

const priceHistorySchema = new mongoose.Schema({
  price: Number,
  date: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [{ type: String }],
  category: {
    type: String,
    enum: ['electronics', 'fashion', 'sports', 'home', 'beauty', 'books'],
    required: true,
  },
  moods: [{
    type: String,
    enum: ['energetic', 'chill', 'luxurious', 'adventurous', 'creative', 'romantic'],
  }],
  stock: { type: Number, required: true, default: 0 },
  sold: { type: Number, default: 0 },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFlashDeal: { type: Boolean, default: false },
  flashDealEnds: { type: Date },
  flashDiscount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  priceHistory: [priceHistorySchema],
  tags: [String],
}, { timestamps: true });

// Indexes for common query patterns
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ moods: 1 });
productSchema.index({ isTrending: 1, sold: -1 });
productSchema.index({ isFlashDeal: 1, flashDealEnds: 1 });
productSchema.index({ sold: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
