const { Tweet, User, Follow } = require('../models');

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

    let userResults = users.map((u) => ({ ...u.toObject(), isFollowing: false }));

    if (req.user && users.length > 0) {
      const follows = await Follow.find({
        followerId: req.user._id,
        followingId: { $in: users.map((u) => u._id) },
      }).select('followingId');

      const followingSet = new Set(follows.map((f) => f.followingId.toString()));
      userResults = users.map((u) => ({
        ...u.toObject(),
        isFollowing: followingSet.has(u._id.toString()),
      }));
    }

    res.json({ tweets, users: userResults });
  } catch (error) {
    next(error);
  }
};

module.exports = { search };
