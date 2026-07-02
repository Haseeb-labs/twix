const express = require('express');
const multer = require('multer');
const {
  createTweet,
  deleteTweet,
  getTweetById,
  getTweetsByUser,
  getFeed,
  getExplore,
} = require('../controllers/tweetController');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = express.Router();

router.post('/', protect, upload.single('image'), createTweet);
router.delete('/:id', protect, deleteTweet);
router.get('/feed', protect, getFeed);
router.get('/explore', getExplore);
router.get('/user/:userId', getTweetsByUser);
router.get('/:id', getTweetById);

module.exports = router;
