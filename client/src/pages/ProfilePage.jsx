import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import InfiniteFeed from '../components/InfiniteFeed';
import UserAvatar from '../components/UserAvatar';
import FollowButton from '../components/FollowButton';
import { useAuth } from '../context/AuthContext';
import { getUserByHandleApi, updateProfileApi } from '../api/users';
import { getTweetsByUserApi } from '../api/tweets';

const BackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-gray-500">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm7-11h-3.17L14 1H10L8.17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h3.17l.58-.64.75-.86h4.99l.75.86.58.64H19v14z" />
  </svg>
);

function joinedDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function EditProfileModal({ user, onClose, onSaved }) {
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user.avatarUrl ?? null);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('username', username);
      fd.append('bio', bio);
      if (avatar) fd.append('avatar', avatar);
      return updateProfileApi(fd);
    },
    onSuccess: (data) => {
      onSaved(data.user);
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message ?? 'Failed to save profile');
    },
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-8 px-4">
      <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-lg">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-800">
          <button
            onClick={onClose}
            className="text-white hover:bg-gray-900 rounded-full p-1.5 transition-colors"
          >
            <CloseIcon />
          </button>
          <h2 className="text-white font-bold text-xl flex-1">Edit profile</h2>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !username.trim()}
            className="px-4 py-1.5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {preview ? (
                <img src={preview} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-twitter flex items-center justify-center text-white text-2xl font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                <CameraIcon />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (!f) return;
                    setAvatar(f);
                    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
                    setPreview(URL.createObjectURL(f));
                  }}
                />
              </label>
            </div>
            <p className="text-gray-500 text-sm">Hover to change photo</p>
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-1">Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
              className="w-full bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-twitter transition-colors"
            />
          </div>

          <div>
            <label className="block text-gray-500 text-sm mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="Tell the world about yourself"
              className="w-full bg-transparent border border-gray-700 rounded-lg px-3 py-2 text-white resize-none placeholder-gray-600 focus:outline-none focus:border-twitter transition-colors"
            />
            <p className="text-gray-600 text-xs text-right mt-1">{bio.length}/160</p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { user: me, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [followersDelta, setFollowersDelta] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile', handle, me?._id ?? 'anon'],
    queryFn: () => getUserByHandleApi(handle),
  });

  const profileUser = data?.user;
  const isOwn = me?._id === profileUser?._id;
  const isFollowing = data?.isFollowing ?? false;

  const handleSaved = async (updatedUser) => {
    queryClient.setQueryData(['profile', handle, me?._id ?? 'anon'], (old) =>
      old ? { ...old, user: updatedUser } : old
    );
    await refreshUser();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-twitter border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (isError || !profileUser) {
    return (
      <Layout>
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white hover:bg-gray-900 rounded-full p-2 -ml-2 transition-colors">
            <BackIcon />
          </button>
          <h1 className="text-white text-xl font-bold">Profile</h1>
        </div>
        <div className="px-4 py-16 text-center">
          <h2 className="text-white text-2xl font-bold mb-2">This account doesn't exist</h2>
          <p className="text-gray-500">Try searching for another.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {showEdit && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:bg-gray-900 rounded-full p-2 -ml-2 transition-colors"
        >
          <BackIcon />
        </button>
        <div>
          <h1 className="text-white text-xl font-bold leading-tight">{profileUser.username}</h1>
        </div>
      </div>

      {/* Cover photo */}
      <div className="h-48 bg-gray-800" />

      {/* Avatar + action row */}
      <div className="px-4 pb-3">
        <div className="flex items-end justify-between -mt-12 mb-3">
          <div className="ring-4 ring-black rounded-full">
            <UserAvatar user={profileUser} size={96} />
          </div>
          <div className="mt-4">
            {isOwn ? (
              <button
                onClick={() => setShowEdit(true)}
                className="px-4 py-1.5 rounded-full border border-gray-600 text-white font-bold text-sm hover:bg-gray-900 transition-colors"
              >
                Edit profile
              </button>
            ) : me ? (
              <FollowButton
                userId={profileUser._id}
                initialFollowing={isFollowing}
                onToggle={(nowFollowing) =>
                  setFollowersDelta((d) => d + (nowFollowing ? 1 : -1))
                }
              />
            ) : null}
          </div>
        </div>

        <h2 className="text-white text-xl font-bold">{profileUser.username}</h2>
        <p className="text-gray-500 text-[15px]">@{profileUser.handle}</p>

        {profileUser.bio && (
          <p className="text-white mt-3 leading-normal whitespace-pre-wrap">{profileUser.bio}</p>
        )}

        <div className="flex items-center gap-1.5 mt-3">
          <CalendarIcon />
          <span className="text-gray-500 text-sm">Joined {joinedDate(profileUser.createdAt)}</span>
        </div>

        <div className="flex items-center gap-5 mt-3">
          <span>
            <span className="text-white font-bold">{profileUser.followingCount}</span>
            <span className="text-gray-500 ml-1 text-sm">Following</span>
          </span>
          <span>
            <span className="text-white font-bold">
              {profileUser.followersCount + followersDelta}
            </span>
            <span className="text-gray-500 ml-1 text-sm">Followers</span>
          </span>
        </div>
      </div>

      {/* Tweets tab */}
      <div className="border-b border-gray-800 flex">
        <div className="flex-1 flex items-center justify-center py-4 border-b-2 border-twitter">
          <span className="text-white font-bold text-sm">Tweets</span>
        </div>
      </div>

      {/* Tweets feed */}
      <InfiniteFeed
        queryKey={['userTweets', profileUser._id]}
        queryFn={({ pageParam }) => getTweetsByUserApi({ userId: profileUser._id, pageParam })}
        emptyMessage={{
          title: 'No tweets yet',
          subtitle: `@${profileUser.handle} hasn't tweeted anything.`,
        }}
      />
    </Layout>
  );
}
