import api from './axios';

export const searchApi = (q) => api.get('/search', { params: { q } }).then((r) => r.data);
