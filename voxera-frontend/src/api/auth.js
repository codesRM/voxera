import api from './axios';

export const register      = (data)     => api.post('/auth/register', data);
export const login         = (data)     => api.post('/auth/login', data);
export const logout        = ()         => api.post('/auth/logout');
export const getMe         = ()         => api.get('/auth/me');

// ✅ NEW — Availability checks
export const checkUsername = (username) => api.get(`/auth/check-username?username=${username}`);
export const checkEmail    = (email)    => api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);