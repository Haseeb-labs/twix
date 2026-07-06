require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

const { User, Tweet, Follow, Like, Retweet, Notification } = require('../models');
const calculateScore = require('../utils/calculateScore');

const USER_COUNT = 10000;
const TWEET_COUNT = 100000;
const MIN_FOLLOWING = 20;
const MAX_FOLLOWING = 50;
const MAX_LIKES_PER_TWEET = 10;
const MAX_RETWEETS_PER_TWEET = 4;
const SPREAD_DAYS = 90;
const INSERT_BATCH_SIZE = 2000;
const ENGAGEMENT_CHUNK_SIZE = 2000;
const LOG_INTERVAL = 100;
const SEED_PASSWORD = 'Password123!';

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomPastDate = (maxDaysAgo) => {
  const ms = randomInt(0, maxDaysAgo * 24 * 60 * 60 * 1000);
  return new Date(Date.now() - ms);
};

function sampleDistinctIndices(poolSize, count, excludeIndex = -1) {
  const max = excludeIndex >= 0 ? poolSize - 1 : poolSize;
  const n = Math.min(count, max);
  const picked = new Set();
  while (picked.size < n) {
    const idx = Math.floor(Math.random() * poolSize);
    if (idx !== excludeIndex) picked.add(idx);
  }
  return [...picked];
}

function logProgress(label, current, total) {
  if (current % LOG_INTERVAL === 0 || current === total) {
    console.log(`${label}: ${current}/${total}`);
  }
}

async function insertInBatches(Model, docs, label) {
  for (let i = 0; i < docs.length; i += INSERT_BATCH_SIZE) {
    await Model.insertMany(docs.slice(i, i + INSERT_BATCH_SIZE), { ordered: false });
  }
  console.log(`${label}: inserted ${docs.length} records`);
}

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}

async function clearDatabase() {
  console.log('\n--- Clearing existing data ---');
  await Promise.all([
    User.deleteMany({}),
    Tweet.deleteMany({}),
    Follow.deleteMany({}),
    Like.deleteMany({}),
    Retweet.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Existing data cleared');
}

async function seedUsers() {
  console.log('\n--- Seeding users ---');
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const usedUsernames = new Set();
  const docs = [];

  for (let i = 0; i < USER_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    let username = faker.person.fullName({ firstName, lastName });
    while (usedUsernames.has(username)) {
      username = faker.person.fullName();
    }
    usedUsernames.add(username);

    const handleBase = faker.internet
      .username({ firstName, lastName })
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');
    const handle = `${handleBase}${i}`;

    docs.push({
      username,
      handle,
      email: `${handleBase}${i}@example.com`,
      password: passwordHash,
      bio: faker.lorem.sentence(),
      avatarUrl: faker.image.avatar(),
      followersCount: 0,
      followingCount: 0,
      createdAt: randomPastDate(365),
    });

    logProgress('Users generated', i + 1, USER_COUNT);
  }

  await insertInBatches(User, docs, 'Users');

  const inserted = await User.find({}, { _id: 1 }).lean();
  return inserted.map((u) => u._id);
}

async function updateFollowCounts() {
  console.log('Updating follower/following counts...');

  const [followingCounts, followerCounts] = await Promise.all([
    Follow.aggregate([{ $group: { _id: '$followerId', count: { $sum: 1 } } }]),
    Follow.aggregate([{ $group: { _id: '$followingId', count: { $sum: 1 } } }]),
  ]);

  const ops = [
    ...followingCounts.map(({ _id, count }) => ({
      updateOne: { filter: { _id }, update: { $set: { followingCount: count } } },
    })),
    ...followerCounts.map(({ _id, count }) => ({
      updateOne: { filter: { _id }, update: { $set: { followersCount: count } } },
    })),
  ];

  for (let i = 0; i < ops.length; i += INSERT_BATCH_SIZE) {
    await User.bulkWrite(ops.slice(i, i + INSERT_BATCH_SIZE), { ordered: false });
  }
  console.log(`Updated follow counts for ${ops.length} user records`);
}

async function seedFollows(userIds) {
  console.log('\n--- Seeding follows ---');
  const docs = [];

  for (let i = 0; i < userIds.length; i++) {
    const followCount = randomInt(MIN_FOLLOWING, MAX_FOLLOWING);
    const targets = sampleDistinctIndices(userIds.length, followCount, i);

    for (const t of targets) {
      docs.push({
        followerId: userIds[i],
        followingId: userIds[t],
        createdAt: randomPastDate(SPREAD_DAYS),
      });
    }

    logProgress('Follows generated for users', i + 1, userIds.length);
  }

  await insertInBatches(Follow, docs, 'Follows');
  await updateFollowCounts();
}

async function seedTweets(userIds) {
  console.log('\n--- Seeding tweets ---');
  const docs = [];

  for (let i = 0; i < TWEET_COUNT; i++) {
    docs.push({
      authorId: userIds[randomInt(0, userIds.length - 1)],
      text: faker.lorem.sentence({ min: 3, max: 25 }).slice(0, 280),
      imageUrl: '',
      likesCount: 0,
      repliesCount: 0,
      retweetsCount: 0,
      score: 0,
      parentTweetId: null,
      createdAt: randomPastDate(SPREAD_DAYS),
    });

    logProgress('Tweets generated', i + 1, TWEET_COUNT);
  }

  await insertInBatches(Tweet, docs, 'Tweets');

  const inserted = await Tweet.find({}, { _id: 1 }).lean();
  return inserted.map((t) => t._id);
}

async function seedEngagement(userIds, tweetIds) {
  console.log('\n--- Seeding likes and retweets ---');
  let processed = 0;

  for (let start = 0; start < tweetIds.length; start += ENGAGEMENT_CHUNK_SIZE) {
    const chunk = tweetIds.slice(start, start + ENGAGEMENT_CHUNK_SIZE);
    const likeDocs = [];
    const retweetDocs = [];
    const countOps = [];

    for (const tweetId of chunk) {
      const likerIndices = sampleDistinctIndices(userIds.length, randomInt(0, MAX_LIKES_PER_TWEET));
      for (const idx of likerIndices) {
        likeDocs.push({ userId: userIds[idx], tweetId, createdAt: randomPastDate(SPREAD_DAYS) });
      }

      const retweeterIndices = sampleDistinctIndices(userIds.length, randomInt(0, MAX_RETWEETS_PER_TWEET));
      for (const idx of retweeterIndices) {
        retweetDocs.push({ userId: userIds[idx], tweetId, createdAt: randomPastDate(SPREAD_DAYS) });
      }

      countOps.push({
        updateOne: {
          filter: { _id: tweetId },
          update: { $set: { likesCount: likerIndices.length, retweetsCount: retweeterIndices.length } },
        },
      });

      processed += 1;
      logProgress('Engagement generated for tweets', processed, tweetIds.length);
    }

    if (likeDocs.length) await Like.insertMany(likeDocs, { ordered: false });
    if (retweetDocs.length) await Retweet.insertMany(retweetDocs, { ordered: false });
    if (countOps.length) await Tweet.bulkWrite(countOps, { ordered: false });
  }

  console.log('Likes and retweets seeded');
}

async function recalculateScores() {
  console.log('\n--- Recalculating tweet scores ---');
  const total = await Tweet.countDocuments();
  const cursor = Tweet.find({}, { createdAt: 1, likesCount: 1, repliesCount: 1, retweetsCount: 1 })
    .lean()
    .cursor();

  let ops = [];
  let processed = 0;

  for await (const tweet of cursor) {
    ops.push({
      updateOne: { filter: { _id: tweet._id }, update: { $set: { score: calculateScore(tweet) } } },
    });

    processed += 1;
    if (ops.length >= INSERT_BATCH_SIZE) {
      await Tweet.bulkWrite(ops, { ordered: false });
      ops = [];
    }
    logProgress('Scores recalculated', processed, total);
  }

  if (ops.length) await Tweet.bulkWrite(ops, { ordered: false });
}

async function run() {
  const start = Date.now();
  try {
    await connectDB();
    await clearDatabase();

    const userIds = await seedUsers();
    await seedFollows(userIds);
    const tweetIds = await seedTweets(userIds);
    await seedEngagement(userIds, tweetIds);
    await recalculateScores();

    const seconds = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\nSeeding complete in ${seconds}s`);
    console.log(`All seeded users share the password: ${SEED_PASSWORD}`);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
