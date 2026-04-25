import api from './axios';

// Helper — converts data to FormData if an image file is present
const toFormData = (data) => {
  if (!data.image) return data; // no image → send as plain JSON

  const formData = new FormData();
  if (data.body)      formData.append('body',      data.body);
  if (data.parent_id) formData.append('parent_id', data.parent_id);
  if (data.image)     formData.append('image',      data.image);
  return formData;
};

export const getComments = (postId) => api.get(`/posts/${postId}/comments`);

export const createComment = (postId, data) => {
  const payload = toFormData(data);
  const isForm  = payload instanceof FormData;
  return api.post(`/posts/${postId}/comments`, payload, {
    headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

export const updateComment = (id, data) => {
  const payload = toFormData(data);
  const isForm  = payload instanceof FormData;
  return api.patch(`/comments/${id}`, payload, {
    headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

export const deleteComment = (id) => api.delete(`/comments/${id}`);