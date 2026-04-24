import api from './axios';

export const getNotifications = (page = 1)   => api.get(`/notifications?page=${page}`);
export const getUnreadCount   = ()            => api.get('/notifications/unread');
export const markAllRead      = ()            => api.put('/notifications/read-all');
export const markOneRead      = (id)          => api.put(`/notifications/${id}/read`);