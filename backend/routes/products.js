const router = require('express').Router();
const {
  getProducts, getProductById, getRecommendations, getTrending,
  createProduct, updateProduct, deleteProduct, addReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/trending', getTrending);
router.get('/:id', getProductById);
router.get('/:id/recommendations', getRecommendations);
router.post('/:id/reviews', protect, addReview);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
