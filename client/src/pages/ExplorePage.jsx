import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import InfiniteFeed from '../components/InfiniteFeed';
import TweetCard from '../components/TweetCard';
import UserAvatar from '../components/UserAvatar';
import FollowButton from '../components/FollowButton';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { getExploreApi } from '../api/tweets';
import { searchApi } from '../api/search';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const handleSearch = useCallback((q) => setQuery(q), []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi(query),
    enabled: query.length > 0,
  });

  return (
    <Layout>
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-gray-800 px-4 py-3">
        <SearchBar onSearch={handleSearch} placeholder="Search Twix" />
      </div>

      {!query ? (
        <>
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-white font-bold text-lg">Top tweets</h2>
          </div>
          <InfiniteFeed
            queryKey={['explore']}
            queryFn={getExploreApi}
            emptyMessage={{
              title: 'No tweets yet',
              subtitle: 'Be the first to tweet something.',
            }}
          />
        </>
      ) : (
        <SearchResults
          isLoading={isLoading}
          isError={isError}
          data={data}
          query={query}
          me={me}
          navigate={navigate}
        />
      )}
    </Layout>
  );
}

function SearchResults({ isLoading, isError, data, query, me, navigate }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-twitter border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center text-gray-500">
        Something went wrong. Try again.
      </div>
    );
  }

  const users = data?.users ?? [];
  const tweets = data?.tweets ?? [];

  if (users.length === 0 && tweets.length === 0) {
    return (
      <div className="py-16 px-8 text-center">
        <p className="text-white text-2xl font-bold mb-2">No results for &ldquo;{query}&rdquo;</p>
        <p className="text-gray-500">Try searching for something else.</p>
      </div>
    );
  }

  return (
    <div>
      {users.length > 0 && (
        <>
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-white font-bold text-lg">People</h2>
          </div>
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-start gap-3 px-4 py-3 border-b border-gray-800 hover:bg-gray-950 cursor-pointer transition-colors"
              onClick={() => navigate('/' + user.handle)}
            >
              <UserAvatar user={user} size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[15px] truncate">{user.username}</p>
                <p className="text-gray-500 text-sm">@{user.handle}</p>
                {user.bio && (
                  <p className="text-gray-300 text-sm mt-1 line-clamp-2">{user.bio}</p>
                )}
              </div>
              {me && me._id !== user._id && (
                <div
                  className="shrink-0 mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FollowButton
                    userId={user._id}
                    initialFollowing={user.isFollowing}
                  />
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {tweets.length > 0 && (
        <>
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-white font-bold text-lg">Tweets</h2>
          </div>
          {tweets.map((tweet) => (
            <TweetCard key={tweet._id} tweet={tweet} />
          ))}
        </>
      )}
    </div>
  );
}
