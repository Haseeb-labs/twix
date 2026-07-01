const mongoose = require('mongoose');
const { Follow, User, Notification } = require('../models');

const followUser = async (req, res, next) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(followingId)) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (followerId.toString() === followingId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(followingId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Follow.create({ followerId, followingId });

    await Promise.all([
      User.updateOne({ _id: followerId }, { $inc: { followingCount: 1 } }),
      User.updateOne({ _id: followingId }, { $inc: { followersCount: 1 } }),
      Notification.create({ recipientId: followingId, actorId: followerId, type: 'follow' }),
    ]);

    res.status(201).json({ message: 'Followed successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    next(error);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(followingId)) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (followerId.toString() === followingId) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const follow = await Follow.findOneAndDelete({ followerId, followingId });
    if (!follow) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    await Promise.all([
      User.updateOne({ _id: followerId }, { $inc: { followingCount: -1 } }),
      User.updateOne({ _id: followingId }, { $inc: { followersCount: -1 } }),
    ]);

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { followUser, unfollowUser };
