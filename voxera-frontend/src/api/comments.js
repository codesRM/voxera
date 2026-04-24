import api from './axios';

export const getComments   = (postId)        => api.get(`/posts/${postId}/comments`);
export const createComment = (postId, data)  => api.post(`/posts/${postId}/comments`, data);
export const updateComment = (id, data)      => api.patch(`/comments/${id}`, data);
export const deleteComment = (id)            => api.delete(`/comments/${id}`);