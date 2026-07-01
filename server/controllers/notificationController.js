const mongoose = require('mongoose');
const { Notification } = require('../models');

const ACTOR_FIELDS = 'username handle avatarUrl';

const getNotifications = async (req, res, next) => {
  try {
    const { cursor, limit = 20 } = req.query;

    if (cursor && !mongoose.Types.ObjectId.isValid(cursor)) {
      return res.status(400).json({ message: 'Invalid cursor' });
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 50);
    const query = { recipientId: req.user._id };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const notifications = await Notification.find(query)
      .sort({ _id: -1 })
      .limit(parsedLimit + 1)
      .populate('actorId', ACTOR_FIELDS)
      .populate('tweetId', 'text');

    const hasMore = notifications.length > parsedLimit;
    const results = hasMore ? notifications.slice(0, parsedLimit) : notifications;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;

    res.json({ notifications: results, nextCursor, hasMore });
  } catch (error) {
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAllRead };
