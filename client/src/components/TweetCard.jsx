import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/AuthContext';
import { likeTweetApi, unlikeTweetApi } from '../api/likes';
import { retweetApi, unretweetApi } from '../api/retweets';
import { deleteTweetApi } from '../api/tweets';
import timeAgo from '../utils/timeAgo';

const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
    <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.515 5.157z" />
  </svg>
);

const RetweetIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
    <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z" />
  </svg>
);

const HeartOutlineIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
    <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.015-.03-1.426-2.965-3.955-2.965z" />
  </svg>
);

const HeartFilledIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
    <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19,6l-1,14H6L5,6" />
    <path d="M10,11v6M14,11v6" />
    <path d="M9,6V4h6v2" />
  </svg>
);

export default function TweetCard({ tweet }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tweet.likesCount ?? 0);
  const [retweeted, setRetweeted] = useState(false);
  const [retweetsCount, setRetweetsCount] = useState(tweet.retweetsCount ?? 0);

  const author = tweet.authorId;
  const isOwn = user?._id === author?._id;

  const likeMutation = useMutation({
    mutationFn: (shouldLike) => (shouldLike ? likeTweetApi(tweet._id) : unlikeTweetApi(tweet._id)),
    onMutate: (shouldLike) => {
      const wasLiked = !shouldLike;
      setLiked(shouldLike);
      setLikesCount((n) => (wasLiked ? n - 1 : n + 1));
      return { wasLiked };
    },
    onError: (_err, _vars, ctx) => {
      setLiked(ctx.wasLiked);
      setLikesCount((n) => (ctx.wasLiked ? n + 1 : n - 1));
    },
    onSuccess: (data) => {
      setLikesCount(data.likesCount);
      setLiked(data.liked);
    },
  });

  const retweetMutation = useMutation({
    mutationFn: (shouldRetweet) => (shouldRetweet ? retweetApi(tweet._id) : unretweetApi(tweet._id)),
    onMutate: (shouldRetweet) => {
      const wasRetweeted = !shouldRetweet;
      setRetweeted(shouldRetweet);
      setRetweetsCount((n) => (wasRetweeted ? n - 1 : n + 1));
      return { wasRetweeted };
    },
    onError: (_err, _vars, ctx) => {
      setRetweeted(ctx.wasRetweeted);
      setRetweetsCount((n) => (ctx.wasRetweeted ? n + 1 : n - 1));
    },
    onSuccess: (data) => {
      setRetweetsCount(data.retweetsCount);
      setRetweeted(data.retweeted);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTweetApi(tweet._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  return (
    <article className="border-b border-gray-800 px-4 py-3 hover:bg-white/[0.03] transition-colors">
      <div className="flex gap-3">
        <Link to={`/${author?.handle}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
          <UserAvatar user={author} size={40} />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-1 min-w-0">
              <Link
                to={`/${author?.handle}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-white hover:underline truncate"
              >
                {author?.username}
              </Link>
              <span className="text-gray-500 truncate">@{author?.handle}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 shrink-0 text-sm">{timeAgo(tweet.createdAt)}</span>
            </div>

            {isOwn && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }}
                disabled={deleteMutation.isPending}
                className="text-gray-600 hover:text-red-500 p-1 rounded-full hover:bg-red-500/10 transition-colors shrink-0"
                title="Delete tweet"
              >
                <TrashIcon />
              </button>
            )}
          </div>

          <Link to={`/tweet/${tweet._id}`} className="block mt-1">
            <p className="text-white leading-normal break-words whitespace-pre-wrap">{tweet.text}</p>
            {tweet.imageUrl && (
              <img
                src={tweet.imageUrl}
                alt="Tweet image"
                className="mt-3 rounded-2xl max-h-80 w-full object-cover border border-gray-800"
              />
            )}
          </Link>

          <div className="flex items-center mt-3 -ml-2 gap-2">
            <Link
              to={`/tweet/${tweet._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-gray-500 hover:text-twitter group px-2 py-1.5 rounded-full hover:bg-twitter/10 transition-colors"
            >
              <span className="transition-colors"><ReplyIcon /></span>
              <span className="text-sm">{tweet.repliesCount ?? 0}</span>
            </Link>

            <button
              onClick={(e) => { e.stopPropagation(); retweetMutation.mutate(!retweeted); }}
              disabled={retweetMutation.isPending}
              className={`flex items-center gap-1.5 group px-2 py-1.5 rounded-full hover:bg-green-500/10 transition-colors ${retweeted ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
            >
              <RetweetIcon />
              <span className="text-sm">{retweetsCount}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); likeMutation.mutate(!liked); }}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-1.5 group px-2 py-1.5 rounded-full hover:bg-pink-500/10 transition-colors ${liked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
            >
              {liked ? <HeartFilledIcon /> : <HeartOutlineIcon />}
              <span className="text-sm">{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
