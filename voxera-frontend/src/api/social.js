import api from './axios';

export const followUser          = (userId)              => api.post(`/social/follow/${userId}`);
export const unfollowUser        = (userId)              => api.delete(`/social/follow/${userId}`);
export const getFollowers        = (userId)              => api.get(`/social/${userId}/followers`);
export const getFollowing        = (userId)              => api.get(`/social/${userId}/following`);
export const sendFriendRequest   = (userId)              => api.post(`/social/friends/request/${userId}`);
export const respondFriendReq    = (requestId, status)  => api.patch(`/social/friends/request/${requestId}`, { status });
export const getFriendRequests   = ()                    => api.get('/social/friends/requests');
export const getFriends          = ()                    => api.get('/social/friends');
export const blockUser           = (userId)              => api.post(`/social/block/${userId}`);
export const unblockUser         = (userId)              => api.delete(`/social/block/${userId}`);