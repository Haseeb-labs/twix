const { User, Follow } = require('../models');
const { uploadToCloudinary } = require('../utils/cloudinary');

const getUserByHandle = async (req, res, next) => {
  try {
    const { handle } = req.params;
    const user = await User.findOne({ handle: handle.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({ followerId: req.user._id, followingId: user._id });
      isFollowing = !!follow;
    }

    res.json({ user, isFollowing });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { username, bio } = req.body;
    const updates = {};
    if (username !== undefined) updates.username = username.trim();
    if (bio !== undefined) updates.bio = bio;
    if (req.file) {
      updates.avatarUrl = await uploadToCloudinary(req.file.buffer);
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    next(error);
  }
};

module.exports = { getUserByHandle, updateProfile };
