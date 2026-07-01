const mongoose = require('mongoose');
const { Retweet, Tweet, Notification } = require('../models');
const calculateScore = require('../utils/calculateScore');

const retweetTweet = async (req, res, next) => {
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

    await Retweet.create({ userId, tweetId });

    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $inc: { retweetsCount: 1 } },
      { new: true }
    );

    const newScore = calculateScore(tweet);
    await Tweet.updateOne({ _id: tweetId }, { $set: { score: newScore } });

    if (tweet.authorId.toString() !== userId.toString()) {
      await Notification.create({ recipientId: tweet.authorId, actorId: userId, type: 'retweet', tweetId });
    }

    res.status(201).json({ retweeted: true, retweetsCount: tweet.retweetsCount, score: newScore });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tweet already retweeted' });
    }
    next(error);
  }
};

const unretweetTweet = async (req, res, next) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const retweet = await Retweet.findOneAndDelete({ userId, tweetId });
    if (!retweet) {
      return res.status(400).json({ message: 'Tweet not retweeted' });
    }

    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $inc: { retweetsCount: -1 } },
      { new: true }
    );

    const newScore = calculateScore(tweet);
    await Tweet.updateOne({ _id: tweetId }, { $set: { score: newScore } });

    res.json({ retweeted: false, retweetsCount: tweet.retweetsCount, score: newScore });
  } catch (error) {
    next(error);
  }
};

module.exports = { retweetTweet, unretweetTweet };
