import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import TweetCard from './TweetCard';

export default function InfiniteFeed({ queryKey, queryFn, emptyMessage }) {
  const sentinelRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null,
  });

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

  if (status === 'pending') {
    return (
      <div className="flex justify-center py-10">
        <div className="w-7 h-7 border-2 border-twitter border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="py-10 text-center text-gray-500 text-sm">Failed to load tweets.</div>
    );
  }

  const tweets = data.pages.flatMap((page) => page.tweets);

  if (tweets.length === 0) {
    return (
      <div className="py-14 px-8 text-center">
        <p className="text-2xl font-bold text-white mb-2">
          {emptyMessage?.title ?? 'Nothing here yet'}
        </p>
        <p className="text-gray-500">
          {emptyMessage?.subtitle ?? 'Follow people to see their tweets here.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {tweets.map((tweet) => (
        <TweetCard key={tweet._id} tweet={tweet} />
      ))}

      <div ref={sentinelRef} className="py-6 flex justify-center">
        {isFetchingNextPage && (
          <div className="w-7 h-7 border-2 border-twitter border-t-transparent rounded-full animate-spin" />
        )}
        {!hasNextPage && tweets.length > 0 && (
          <p className="text-gray-600 text-sm">You're all caught up</p>
        )}
      </div>
    </div>
  );
}
