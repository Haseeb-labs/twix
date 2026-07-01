const mongoose = require('mongoose');
const { Like, Tweet, Notification } = require('../models');
const calculateScore = require('../utils/calculateScore');

const likeTweet = async (req, res, next) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const tweetExists = await Tweet.exists({ _id: tweetId });
    if (!tweetExists) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    await Like.create({ userId, tweetId });

    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    const newScore = calculateScore(tweet);
    await Tweet.updateOne({ _id: tweetId }, { $set: { score: newScore } });

    if (tweet.authorId.toString() !== userId.toString()) {
      await Notification.create({ recipientId: tweet.authorId, actorId: userId, type: 'like', tweetId });
    }

    res.status(201).json({ liked: true, likesCount: tweet.likesCount, score: newScore });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tweet already liked' });
    }
    next(error);
  }
};

const unlikeTweet = async (req, res, next) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const like = await Like.findOneAndDelete({ userId, tweetId });
    if (!like) {
      return res.status(400).json({ message: 'Tweet not liked' });
    }

    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );

    const newScore = calculateScore(tweet);
    await Tweet.updateOne({ _id: tweetId }, { $set: { score: newScore } });

    res.json({ liked: false, likesCount: tweet.likesCount, score: newScore });
  } catch (error) {
    next(error);
  }
};

module.exports = { likeTweet, unlikeTweet };
