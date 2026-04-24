import api from './axios';

export const submitReport  = (data) => api.post('/reports', data);
export const getMyReports  = ()     => api.get('/reports/mine');