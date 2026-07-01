const mongoose = require('mongoose');
const { Tweet, Follow } = require('../models');

const AUTHOR_FIELDS = 'username handle avatarUrl';

const createTweet = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Tweet text is required' });
    }

    if (text.length > 280) {
      return res.status(400).json({ message: 'Tweet text must be 280 characters or fewer' });
    }

    const tweet = await Tweet.create({
      authorId: req.user._id,
      text,
    });

    await tweet.populate('authorId', AUTHOR_FIELDS);

    res.status(201).json({ tweet });
  } catch (error) {
    next(error);
  }
};

const deleteTweet = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const tweet = await Tweet.findById(id);
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    if (tweet.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this tweet' });
    }

    await tweet.deleteOne();

    res.json({ message: 'Tweet deleted' });
  } catch (error) {
    next(error);
  }
};

const getTweetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const tweet = await Tweet.findById(id).populate('authorId', AUTHOR_FIELDS);
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const replies = await Tweet.find({ parentTweetId: id })
      .sort({ createdAt: -1 })
      .populate('authorId', AUTHOR_FIELDS);

    res.json({ tweet, replies });
  } catch (error) {
    next(error);
  }
};

const getTweetsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { cursor, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const query = { authorId: userId };
    if (cursor) {
      if (!mongoose.Types.ObjectId.isValid(cursor)) {
        return res.status(400).json({ message: 'Invalid cursor' });
      }
      query._id = { $lt: cursor };
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 50);

    const tweets = await Tweet.find(query)
      .sort({ _id: -1 })
      .limit(parsedLimit + 1)
      .populate('authorId', AUTHOR_FIELDS);

    const hasMore = tweets.length > parsedLimit;
    const results = hasMore ? tweets.slice(0, parsedLimit) : tweets;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;

    res.json({ tweets: results, nextCursor, hasMore });
  } catch (error) {
    next(error);
  }
};

const buildScoreCursorQuery = (base, cursor) => {
  if (!cursor) return base;
  return { ...base, _id: { $lt: cursor } };
};

const paginateByScore = async (query, parsedLimit) => {
  const tweets = await Tweet.find(query)
    .sort({ score: -1, _id: -1 })
    .limit(parsedLimit + 1)
    .populate('authorId', AUTHOR_FIELDS);

  const hasMore = tweets.length > parsedLimit;
  const results = hasMore ? tweets.slice(0, parsedLimit) : tweets;
  const nextCursor = hasMore ? results[results.length - 1]._id : null;
  return { tweets: results, nextCursor, hasMore };
};

const getFeed = async (req, res, next) => {
  try {
    const { cursor, limit = 20 } = req.query;

    if (cursor && !mongoose.Types.ObjectId.isValid(cursor)) {
      return res.status(400).json({ message: 'Invalid cursor' });
    }

    const follows = await Follow.find({ followerId: req.user._id }).select('followingId');
    const followingIds = follows.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return res.json({ tweets: [], nextCursor: null, hasMore: false });
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 50);
    const base = { authorId: { $in: followingIds }, parentTweetId: null };
    const result = await paginateByScore(buildScoreCursorQuery(base, cursor), parsedLimit);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getExplore = async (req, res, next) => {
  try {
    const { cursor, limit = 20 } = req.query;

    if (cursor && !mongoose.Types.ObjectId.isValid(cursor)) {
      return res.status(400).json({ message: 'Invalid cursor' });
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 50);
    const base = { parentTweetId: null };
    const result = await paginateByScore(buildScoreCursorQuery(base, cursor), parsedLimit);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTweet, deleteTweet, getTweetById, getTweetsByUser, getFeed, getExplore };
