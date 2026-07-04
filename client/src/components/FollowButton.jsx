import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { followUserApi, unfollowUserApi } from '../api/follows';

export default function FollowButton({ userId, initialFollowing = false, onToggle }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [hovering, setHovering] = useState(false);

  // Sync when parent query resolves with the real isFollowing value
  useEffect(() => {
    if (!mutation.isPending) setFollowing(initialFollowing);
  }, [initialFollowing]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: (shouldFollow) =>
      shouldFollow ? followUserApi(userId) : unfollowUserApi(userId),
    onMutate: (shouldFollow) => {
      setFollowing(shouldFollow);
      onToggle?.(shouldFollow);
    },
    onError: (_err, shouldFollow) => {
      setFollowing(!shouldFollow);
      onToggle?.(!shouldFollow);
    },
  });

  const handleClick = () => mutation.mutate(!following);

  if (following) {
    return (
      <button
        onClick={handleClick}
        disabled={mutation.isPending}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`px-4 py-1.5 rounded-full border font-bold text-sm transition-colors disabled:opacity-50 ${
          hovering
            ? 'border-red-600 text-red-600 bg-red-600/10'
            : 'border-gray-600 text-white'
        }`}
      >
        {hovering ? 'Unfollow' : 'Following'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={mutation.isPending}
      className="px-4 py-1.5 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
    >
      Follow
    </button>
  );
}
