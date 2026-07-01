const express = require('express');
const authRoutes = require('./auth');
const tweetRoutes = require('./tweets');
const followRoutes = require('./follows');
const likeRoutes = require('./likes');
const retweetRoutes = require('./retweets');
const notificationRoutes = require('./notifications');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Twix API is running' });
});

router.use('/auth', authRoutes);
router.use('/tweets', tweetRoutes);
router.use('/follows', followRoutes);
router.use('/likes', likeRoutes);
router.use('/retweets', retweetRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
