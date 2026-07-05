import api from './axios';

export const getNotificationsApi = ({ pageParam } = {}) =>
  api
    .get('/notifications', { params: pageParam ? { cursor: pageParam } : {} })
    .then((r) => r.data);

export const markAllReadApi = () => api.put('/notifications/read').then((r) => r.data);
