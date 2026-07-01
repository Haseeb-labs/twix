const { User } = require('../models');
const { generateTokens } = require('../utils/generateToken');

const formatUser = (user) => ({
  _id: user._id,
  username: user.username,
  handle: user.handle,
  email: user.email,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  followersCount: user.followersCount,
  followingCount: user.followingCount,
  createdAt: user.createdAt,
});

const register = async (req, res, next) => {
  try {
    const { username, handle, email, password } = req.body;

    if (!username || !handle || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedHandle = handle.replace(/^@/, '').toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { handle: normalizedHandle }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      handle: normalizedHandle,
      email,
      password,
    });

    const tokens = generateTokens(user._id);

    res.status(201).json({
      user: formatUser(user),
      ...tokens,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = generateTokens(user._id);

    res.json({
      user: formatUser(user),
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const getMe = (req, res) => {
  res.json({ user: formatUser(req.user) });
};

module.exports = { register, login, logout, getMe };
