import api from './axios';

export const castVote = (targetType, targetId, value) =>
  api.post(`/votes/${targetType}/${targetId}`, { value });