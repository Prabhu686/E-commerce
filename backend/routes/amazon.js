const router = require('express').Router();
const { searchAmazon, getAmazonProduct, getAmazonVariations, getApiStatus } = require('../controllers/amazonController');

router.get('/status', getApiStatus);
router.get('/search', searchAmazon);
router.get('/product/:asin', getAmazonProduct);
router.get('/product/:asin/variations', getAmazonVariations);

module.exports = router;
