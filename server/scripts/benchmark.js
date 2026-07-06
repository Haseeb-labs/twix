require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const { User, Tweet, Follow } = require('../models');

const ITERATIONS = 5;
const FEED_LIMIT = 20;
const AUTHOR_FIELDS = 'username handle avatarUrl';

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}

async function pickBenchmarkUser() {
  const [candidate] = await Follow.aggregate([
    { $group: { _id: '$followerId', count: { $sum: 1 } } },
    { $match: { count: { $gte: 10 } } },
    { $sample: { size: 1 } },
  ]);

  if (!candidate) {
    throw new Error('No user found who follows at least 10 people. Run the seed script first.');
  }

  const user = await User.findById(candidate._id).select('username handle');
  const follows = await Follow.find({ followerId: candidate._id }).select('followingId');

  return {
    user,
    followingIds: follows.map((f) => f.followingId),
    followingCount: candidate.count,
  };
}

async function timeFeedQuery(followingIds) {
  const query = { authorId: { $in: followingIds }, parentTweetId: null };
  const times = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const start = process.hrtime.bigint();
    await Tweet.find(query)
      .sort({ score: -1, _id: -1 })
      .limit(FEED_LIMIT)
      .populate('authorId', AUTHOR_FIELDS);
    const ms = Number(process.hrtime.bigint() - start) / 1e6;

    times.push(ms);
    console.log(`  run ${i + 1}/${ITERATIONS}: ${ms.toFixed(2)}ms`);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return { times, avg };
}

async function dropScoreIndexes() {
  const indexes = await Tweet.collection.indexes();
  const scoreIndexes = indexes.filter((idx) =>
    Object.prototype.hasOwnProperty.call(idx.key, 'score')
  );

  for (const idx of scoreIndexes) {
    await Tweet.collection.dropIndex(idx.name);
    console.log(`Dropped index: ${idx.name}`);
  }

  if (!scoreIndexes.length) {
    console.log('No score indexes were present to drop');
  }
}

async function restoreIndexes() {
  await Tweet.syncIndexes();
  console.log('Indexes restored from schema');
}

async function run() {
  try {
    await connectDB();
    await Tweet.findOne();

    const { user, followingIds, followingCount } = await pickBenchmarkUser();
    console.log(`\nBenchmark user: @${user.handle} (follows ${followingCount} users)`);

    let without;
    console.log('\n--- Dropping score indexes ---');
    await dropScoreIndexes();

    try {
      console.log('\n--- Feed query WITHOUT indexes ---');
      without = await timeFeedQuery(followingIds);
    } finally {
      console.log('\n--- Restoring indexes ---');
      await restoreIndexes();
    }

    console.log('\n--- Feed query WITH indexes ---');
    const withIndexes = await timeFeedQuery(followingIds);

    console.log('\n=== Results ===');
    console.log(
      `Without indexes: avg ${without.avg.toFixed(2)}ms  (runs: ${without.times
        .map((t) => t.toFixed(2))
        .join(', ')})`
    );
    console.log(
      `With indexes:    avg ${withIndexes.avg.toFixed(2)}ms  (runs: ${withIndexes.times
        .map((t) => t.toFixed(2))
        .join(', ')})`
    );
    console.log(`Speedup: ${(without.avg / withIndexes.avg).toFixed(2)}x`);
  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
