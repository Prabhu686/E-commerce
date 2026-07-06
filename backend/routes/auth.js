const router = require('express').Router();
const { register, login, getProfile, updateProfile, spinWheel, toggleWishlist, getAllUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/spin', protect, spinWheel);
router.put('/wishlist/:productId', protect, toggleWishlist);
router.get('/users', protect, admin, getAllUsers);

module.exports = router;
