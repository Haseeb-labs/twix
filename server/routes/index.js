const express = require('express');
const authRoutes = require('./auth');
const tweetRoutes = require('./tweets');
const followRoutes = require('./follows');
const likeRoutes = require('./likes');
const retweetRoutes = require('./retweets');
const notificationRoutes = require('./notifications');
const searchRoutes = require('./search');
const userRoutes = require('./users');

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
router.use('/search', searchRoutes);
router.use('/users', userRoutes);

module.exports = router;
