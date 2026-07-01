const mongoose = require('mongoose');

const retweetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tweetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tweet', required: true },
  createdAt: { type: Date, default: Date.now },
});

retweetSchema.index({ userId: 1, tweetId: 1 }, { unique: true });

module.exports = mongoose.model('Retweet', retweetSchema);
