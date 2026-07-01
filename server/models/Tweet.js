const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, maxlength: 280 },
  imageUrl: { type: String, default: '' },
  likesCount: { type: Number, default: 0 },
  repliesCount: { type: Number, default: 0 },
  retweetsCount: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  parentTweetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tweet', default: null },
  createdAt: { type: Date, default: Date.now },
});

tweetSchema.index({ score: -1 });
tweetSchema.index({ authorId: 1, score: -1 });
tweetSchema.index({ text: 'text' });

module.exports = mongoose.model('Tweet', tweetSchema);
