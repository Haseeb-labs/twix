const express = require('express');
const {
  createTweet,
  deleteTweet,
  getTweetById,
  getTweetsByUser,
  getFeed,
  getExplore,
} = require('../controllers/tweetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createTweet);
router.delete('/:id', protect, deleteTweet);
router.get('/feed', protect, getFeed);
router.get('/explore', getExplore);
router.get('/user/:userId', getTweetsByUser);
router.get('/:id', getTweetById);

module.exports = router;
