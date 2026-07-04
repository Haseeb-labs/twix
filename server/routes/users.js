const express = require('express');
const multer = require('multer');
const { getUserByHandle, updateProfile } = require('../controllers/userController');
const { protect, optionalProtect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed'));
  },
});

const router = express.Router();

router.put('/me', protect, upload.single('avatar'), updateProfile);
router.get('/:handle', optionalProtect, getUserByHandle);

module.exports = router;
