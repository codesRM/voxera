import api from './axios';

export const getUserProfile = (username)  => api.get(`/users/${username}`);
export const getUserPosts   = (username)  => api.get(`/users/${username}/posts`);
export const updateProfile  = (data)      => api.patch('/users/profile', data);
export const searchUsers    = (q)         => api.get(`/users/search?q=${q}`);