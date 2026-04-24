import api from './axios';

export const getFeed = ({ page = 1, filter, sort } = {}) => {
  const params = new URLSearchParams({ page: String(page) });
  if (filter) params.set('filter', filter);
  if (sort)   params.set('sort', sort);
  return api.get(`/posts?${params.toString()}`);
};
export const getPost      = (id)             => api.get(`/posts/${id}`);
export const createPost   = (data)           => api.post('/posts', data);
export const updatePost   = (id, data)       => api.patch(`/posts/${id}`, data);
export const deletePost   = (id)             => api.delete(`/posts/${id}`);
export const repost       = (id, data)       => api.post(`/posts/${id}/repost`, data);