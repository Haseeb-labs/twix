const express = require('express');
const { followUser, unfollowUser } = require('../controllers/followController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/:id', protect, followUser);
router.delete('/:id', protect, unfollowUser);

module.exports = router;
