import api from './axios';

export const retweetApi = (tweetId) => api.post(`/retweets/${tweetId}`).then(r => r.data);
export const unretweetApi = (tweetId) => api.delete(`/retweets/${tweetId}`).then(r => r.data);
