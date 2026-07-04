import api from './axios';

export const getFeedApi = ({ pageParam } = {}) =>
  api.get('/tweets/feed', { params: pageParam ? { cursor: pageParam } : {} }).then(r => r.data);

export const getExploreApi = ({ pageParam } = {}) =>
  api.get('/tweets/explore', { params: pageParam ? { cursor: pageParam } : {} }).then(r => r.data);

export const getTweetApi = (id) => api.get(`/tweets/${id}`).then(r => r.data);

export const getTweetsByUserApi = ({ userId, pageParam } = {}) =>
  api.get(`/tweets/user/${userId}`, { params: pageParam ? { cursor: pageParam } : {} }).then(r => r.data);

export const createTweetApi = (formData) => api.post('/tweets', formData).then(r => r.data);

export const deleteTweetApi = (id) => api.delete(`/tweets/${id}`).then(r => r.data);
