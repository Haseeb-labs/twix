import api from './axios';

export const followUserApi = (userId) => api.post(`/follows/${userId}`).then(r => r.data);
export const unfollowUserApi = (userId) => api.delete(`/follows/${userId}`).then(r => r.data);
