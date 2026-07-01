const express = require('express');
const { likeTweet, unlikeTweet } = require('../controllers/likeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/:tweetId', protect, likeTweet);
router.delete('/:tweetId', protect, unlikeTweet);

module.exports = router;
