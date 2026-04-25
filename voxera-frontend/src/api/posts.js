import api from './axios';

// Helper — converts data to FormData if an image file is present
const toFormData = (data) => {
  if (!data.image) return data; // no image → send as plain JSON

  const formData = new FormData();
  if (data.title)     formData.append('title',     data.title);
  if (data.body)      formData.append('body',       data.body);
  if (data.image)     formData.append('image',      data.image);
  return formData;
};

export const getFeed = ({ page = 1, filter, sort } = {}) => {
  const params = new URLSearchParams({ page: String(page) });
  if (filter) params.set('filter', filter);
  if (sort)   params.set('sort',   sort);
  return api.get(`/posts?${params.toString()}`);
};

export const getPost = (id) => api.get(`/posts/${id}`);

export const createPost = (data) => {
  const payload = toFormData(data);
  const isForm  = payload instanceof FormData;
  return api.post('/posts', payload, {
    headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

export const updatePost = (id, data) => {
  const payload = toFormData(data);
  const isForm  = payload instanceof FormData;
  return api.patch(`/posts/${id}`, payload, {
    headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

export const deletePost = (id)        => api.delete(`/posts/${id}`);
export const repost     = (id, data)  => api.post(`/posts/${id}/repost`, data);