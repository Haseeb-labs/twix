import api from './axios';

export const likeTweetApi = (tweetId) => api.post(`/likes/${tweetId}`).then(r => r.data);
export const unlikeTweetApi = (tweetId) => api.delete(`/likes/${tweetId}`).then(r => r.data);
