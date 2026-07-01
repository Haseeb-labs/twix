function calculateScore(tweet) {
  const hoursAgo =
    (Date.now() - new Date(tweet.createdAt).getTime()) / 3600000;
  const timeDecay = 1 / Math.pow(hoursAgo + 2, 1.8);

  const engagementScore =
    0.4 * Math.log(tweet.likesCount + 1) +
    0.45 * Math.log(tweet.repliesCount + 1) +
    0.24 * Math.log(tweet.retweetsCount + 1);

  return engagementScore * timeDecay;
}

module.exports = calculateScore;
