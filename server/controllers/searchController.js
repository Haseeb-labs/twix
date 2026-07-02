const { Tweet, User } = require('../models');

const USER_FIELDS = 'username handle avatarUrl bio followersCount followingCount';

const search = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const [tweets, users] = await Promise.all([
      Tweet.find({ $text: { $search: q } })
        .sort({ _textScore: { $meta: 'textScore' } })
        .limit(20)
        .populate('authorId', 'username handle avatarUrl'),
      User.find({ $text: { $search: q } })
        .sort({ _textScore: { $meta: 'textScore' } })
        .select(USER_FIELDS)
        .limit(20),
    ]);

    res.json({ tweets, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { search };
