const express = require('express');
const { retweetTweet, unretweetTweet } = require('../controllers/retweetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/:tweetId', protect, retweetTweet);
router.delete('/:tweetId', protect, unretweetTweet);

module.exports = router;
