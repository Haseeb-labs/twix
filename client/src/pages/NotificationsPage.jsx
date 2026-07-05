import { useEffect, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import { getNotificationsApi, markAllReadApi } from '../api/notifications';

const TYPE_META = {
  like: {
    label: 'liked your tweet',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-pink-500">
        <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
      </svg>
    ),
  },
  retweet: {
    label: 'retweeted your tweet',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-green-500">
        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
      </svg>
    ),
  },
  follow: {
    label: 'followed you',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-twitter">
        <path d="M17.863 13.44c1.477 1.58 2.366 3.72 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.74 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z" />
      </svg>
    ),
  },
  reply: {
    label: 'replied to your tweet',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-twitter">
        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
      </svg>
    ),
  },
};

function NotificationItem({ notification, navigate }) {
  const meta = TYPE_META[notification.type] ?? { label: 'interacted with you', icon: null };
  const actor = notification.actorId;
  const tweet = notification.tweetId;

  const handleClick = () => {
    if (notification.type === 'follow') {
      navigate('/' + actor.handle);
    } else if (tweet) {
      navigate('/tweet/' + tweet._id);
    }
  };

  return (
    <div
      className={`flex gap-3 px-4 py-3 border-b border-gray-800 hover:bg-gray-950 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-950/20' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center gap-1 pt-1">
        <div className="shrink-0">{meta.icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <UserAvatar user={actor} size={36} />
        </div>
        <p className="text-[15px]">
          <span className="text-white font-bold">{actor?.username}</span>{' '}
          <span className="text-gray-300">{meta.label}</span>
        </p>
        {tweet?.text && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{tweet.text}</p>
        )}
      </div>
      {!notification.read && (
        <div className="shrink-0 mt-2">
          <div className="w-2 h-2 rounded-full bg-twitter" />
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sentinelRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsApi,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: markAllReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    markRead();
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const notifications =
    status === 'success' ? data.pages.flatMap((p) => p.notifications) : [];

  return (
    <Layout>
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-gray-800 px-4 py-3">
        <h1 className="text-white font-bold text-xl">Notifications</h1>
      </div>

      {status === 'pending' && (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-twitter border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {status === 'error' && (
        <div className="py-16 text-center text-gray-500">Failed to load notifications.</div>
      )}

      {status === 'success' && notifications.length === 0 && (
        <div className="py-16 px-8 text-center">
          <p className="text-white text-2xl font-bold mb-2">Nothing to see here yet</p>
          <p className="text-gray-500">
            When someone likes, retweets, or replies to your tweets, you'll see it here.
          </p>
        </div>
      )}

      {status === 'success' && notifications.length > 0 && (
        <div>
          {notifications.map((n) => (
            <NotificationItem key={n._id} notification={n} navigate={navigate} />
          ))}

          <div ref={sentinelRef} className="py-6 flex justify-center">
            {isFetchingNextPage && (
              <div className="w-7 h-7 border-2 border-twitter border-t-transparent rounded-full animate-spin" />
            )}
            {!hasNextPage && notifications.length > 0 && (
              <p className="text-gray-600 text-sm">You're all caught up</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
