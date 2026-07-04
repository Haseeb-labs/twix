import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/AuthContext';
import { createTweetApi } from '../api/tweets';

const MAX_CHARS = 280;

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.413 0 .75.337.75.75v9.676l-3.858-3.858c-.14-.14-.33-.22-.53-.22h-.003c-.2 0-.393.08-.532.224l-4.317 4.384-1.813-1.813c-.14-.14-.33-.22-.53-.22-.193-.03-.395.08-.535.227L3.5 17.642V4.25c0-.413.337-.75.75-.75zm-.744 16.28l5.418-5.534 6.282 6.254H4.25c-.402 0-.727-.322-.744-.72zm16.244.72h-2.42l-5.007-4.987 4.326-4.39 3.851 3.85v4.777c0 .413-.337.75-.75.75z" />
    <circle cx="8.868" cy="8.309" r="1.542" />
  </svg>
);

const XSmallIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M13.414 12l4.293-4.293c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 7.707 6.293c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-4.293 4.293c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l4.293 4.293c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z" />
  </svg>
);

export default function TweetComposer({ placeholder = "What's happening?", parentTweetId = null, onSuccess }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  const remaining = MAX_CHARS - text.length;
  const isOverLimit = remaining < 0;
  const isNearLimit = remaining <= 20 && remaining >= 0;
  const isEmpty = !text.trim() && !image;
  const circumference = 2 * Math.PI * 9;
  const progressRatio = Math.min(text.length / MAX_CHARS, 1.05);
  const dashOffset = circumference * (1 - progressRatio);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('text', text.trim());
      if (image) fd.append('image', image);
      if (parentTweetId) fd.append('parentTweetId', parentTweetId);
      return createTweetApi(fd);
    },
    onSuccess: (data) => {
      setText('');
      setImage(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      onSuccess?.(data.tweet);
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  return (
    <div className="border-b border-gray-800 px-4 pt-3 pb-2">
      <div className="flex gap-3">
        <div className="shrink-0">
          <UserAvatar user={user} size={40} />
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={text.length > 100 ? 4 : 2}
            className="w-full bg-transparent text-white text-xl placeholder-gray-500 outline-none resize-none leading-normal"
          />

          {imagePreview && (
            <div className="relative mt-2 rounded-2xl overflow-hidden border border-gray-800">
              <img src={imagePreview} alt="Preview" className="max-h-72 w-full object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-2 left-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-black/90 transition-colors"
              >
                <XSmallIcon />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-twitter p-2 rounded-full hover:bg-twitter/10 transition-colors"
                title="Add image"
              >
                <ImageIcon />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <div className="flex items-center gap-2">
                  <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90">
                    <circle cx="11" cy="11" r="9" fill="none" stroke="#2f3336" strokeWidth="2" />
                    <circle
                      cx="11" cy="11" r="9"
                      fill="none"
                      stroke={isOverLimit ? '#f4212e' : isNearLimit ? '#ffd400' : '#1d9bf0'}
                      strokeWidth="2"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  {remaining <= 20 && (
                    <span className={`text-sm tabular-nums ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                      {remaining}
                    </span>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => mutation.mutate()}
                disabled={isEmpty || isOverLimit || mutation.isPending}
                className="bg-twitter text-white font-bold px-5 py-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a8cd8] active:scale-95 transition-all text-[15px]"
              >
                {mutation.isPending ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
