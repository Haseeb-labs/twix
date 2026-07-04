import api from './axios';

export const getUserByHandleApi = (handle) => api.get(`/users/${handle}`).then(r => r.data);
export const updateProfileApi = (formData) => api.put('/users/me', formData).then(r => r.data);
