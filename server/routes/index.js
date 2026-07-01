const express = require('express');
const authRoutes = require('./auth');
const tweetRoutes = require('./tweets');
const followRoutes = require('./follows');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Twix API is running' });
});

router.use('/auth', authRoutes);
router.use('/tweets', tweetRoutes);
router.use('/follows', followRoutes);

module.exports = router;
