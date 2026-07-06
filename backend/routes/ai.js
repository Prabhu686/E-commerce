const router = require('express').Router();
const { chatWithBot, moodRecommendations, searchSuggestions, productInsight } = require('../controllers/groqController');

router.post('/chat', chatWithBot);
router.get('/mood/:mood', moodRecommendations);
router.get('/suggestions', searchSuggestions);
router.get('/insight/:id', productInsight);

module.exports = router;
