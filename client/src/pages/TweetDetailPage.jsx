import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Layout from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import TweetCard from '../components/TweetCard';
import TweetComposer from '../components/TweetComposer';
import { useAuth } from '../context/AuthContext';
import { getTweetApi } from '../api/tweets';
import { likeTweetApi, unlikeTweetApi } from '../api/likes';
import { retweetApi, unretweetApi } from '../api/retweets';
import { deleteTweetApi } from '../api/tweets';

const BackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
  </svg>
);

const HeartOutlineIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current">
    <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.015-.03-1.426-2.965-3.955-2.965z" />
  </svg>
);

const HeartFilledIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current">
    <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z" />
  </svg>
);

const RetweetIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current">
    <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z" />
  </svg>
);

const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current">
    <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.515 5.157z" />
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

function formatFullDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function ExpandedTweet({ tweet, onReplyDeleted }) {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      navigate(-1);
    },
  });

  return (
    <div className="px-4 pt-4 pb-2 border-b border-gray-800">
      <div className="flex items-start justify-between gap-2 mb-3">
        <Link to={`/${author?.handle}`} className="flex items-center gap-3 group">
          <UserAvatar user={author} size={48} />
          <div>
            <p className="text-white font-bold leading-tight group-hover:underline">{author?.username}</p>
            <p className="text-gray-500 text-sm">@{author?.handle}</p>
          </div>
        </Link>
        {isOwn && (
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors mt-1"
            title="Delete tweet"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <p className="text-white text-xl leading-relaxed break-words whitespace-pre-wrap mb-3">{tweet.text}</p>

      {tweet.imageUrl && (
        <img
          src={tweet.imageUrl}
          alt="Tweet image"
          className="rounded-2xl max-h-96 w-full object-cover border border-gray-800 mb-3"
        />
      )}

      <p className="text-gray-500 text-sm mb-3">{formatFullDate(tweet.createdAt)}</p>

      {(retweetsCount > 0 || likesCount > 0 || tweet.repliesCount > 0) && (
        <div className="flex gap-5 py-3 border-t border-gray-800 text-sm">
          {retweetsCount > 0 && (
            <span>
              <strong className="text-white">{retweetsCount}</strong>{' '}
              <span className="text-gray-500">Retweet{retweetsCount !== 1 ? 's' : ''}</span>
            </span>
          )}
          {likesCount > 0 && (
            <span>
              <strong className="text-white">{likesCount}</strong>{' '}
              <span className="text-gray-500">Like{likesCount !== 1 ? 's' : ''}</span>
            </span>
          )}
          {tweet.repliesCount > 0 && (
            <span>
              <strong className="text-white">{tweet.repliesCount}</strong>{' '}
              <span className="text-gray-500">{tweet.repliesCount !== 1 ? 'Replies' : 'Reply'}</span>
            </span>
          )}
        </div>
      )}

      <div className="flex gap-6 py-2 border-t border-gray-800">
        <button className="flex items-center gap-2 text-gray-500 hover:text-twitter group rounded-full hover:bg-twitter/10 p-2 transition-colors">
          <ReplyIcon />
        </button>

        <button
          onClick={() => retweetMutation.mutate(!retweeted)}
          disabled={retweetMutation.isPending}
          className={`flex items-center gap-2 group p-2 rounded-full hover:bg-green-500/10 transition-colors ${retweeted ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
        >
          <RetweetIcon />
        </button>

        <button
          onClick={() => likeMutation.mutate(!liked)}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-2 group p-2 rounded-full hover:bg-pink-500/10 transition-colors ${liked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
        >
          {liked ? <HeartFilledIcon /> : <HeartOutlineIcon />}
        </button>
      </div>
    </div>
  );
}

export default function TweetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, status } = useQuery({
    queryKey: ['tweet', id],
    queryFn: () => getTweetApi(id),
    retry: (count, err) => err?.response?.status !== 404 && count < 2,
  });

  const handleReplySuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['tweet', id] });
  };

  return (
    <Layout>
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/10 rounded-full p-2 -ml-2 transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-white font-bold text-xl">Post</h1>
      </div>

      {status === 'pending' && (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-twitter border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {status === 'error' && (
        <div className="py-16 px-8 text-center">
          <p className="text-white text-2xl font-bold mb-2">Tweet not found</p>
          <p className="text-gray-500">This tweet may have been deleted.</p>
        </div>
      )}

      {status === 'success' && data && (
        <>
          <ExpandedTweet tweet={data.tweet} />

          {user && (
            <TweetComposer
              placeholder="Post your reply"
              parentTweetId={id}
              onSuccess={handleReplySuccess}
            />
          )}

          <div>
            {data.replies.length === 0 ? (
              <div className="py-12 px-8 text-center">
                <p className="text-white text-xl font-bold mb-1">No replies yet</p>
                <p className="text-gray-500">Be the first to reply.</p>
              </div>
            ) : (
              data.replies.map((reply) => (
                <TweetCard key={reply._id} tweet={reply} />
              ))
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
