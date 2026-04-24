const socialService = require('./social.service');

// ─── FOLLOWS ───────────────────────────────────────────

const followUser = async (req, res, next) => {
  try {
    const result = await socialService.followUser(
      req.user.id, req.params.userId
    );
    res.status(200).json({ success: true, message: result.message });
  } catch (err) { next(err); }
};

const unfollowUser = async (req, res, next) => {
  try {
    const result = await socialService.unfollowUser(
      req.user.id, req.params.userId
    );
    res.status(200).json({ success: true, message: result.message });
  } catch (err) { next(err); }
};

const getFollowers = async (req, res, next) => {
  try {
    const data = await socialService.getFollowers(req.params.userId);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getFollowing = async (req, res, next) => {
  try {
    const data = await socialService.getFollowing(req.params.userId);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

// ─── FRIEND REQUESTS ───────────────────────────────────

const sendFriendRequest = async (req, res, next) => {
  try {
    const data = await socialService.sendFriendRequest(
      req.user.id, req.params.userId
    );
    res.status(201).json({
      success: true,
      message: 'Friend request sent',
      data,
    });
  } catch (err) { next(err); }
};

const respondToFriendRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    const data = await socialService.respondToFriendRequest(
      req.params.requestId, req.user.id, status
    );
    res.status(200).json({
      success: true,
      message: `Friend request ${status}`,
      data,
    });
  } catch (err) { next(err); }
};

const getFriendRequests = async (req, res, next) => {
  try {
    const data = await socialService.getFriendRequests(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getFriends = async (req, res, next) => {
  try {
    const data = await socialService.getFriends(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

// ─── BLOCKS ────────────────────────────────────────────

const blockUser = async (req, res, next) => {
  try {
    const result = await socialService.blockUser(
      req.user.id, req.params.userId
    );
    res.status(200).json({ success: true, message: result.message });
  } catch (err) { next(err); }
};

const unblockUser = async (req, res, next) => {
  try {
    const result = await socialService.unblockUser(
      req.user.id, req.params.userId
    );
    res.status(200).json({ success: true, message: result.message });
  } catch (err) { next(err); }
};

const getBlockedUsers = async (req, res, next) => {
  try {
    const data = await socialService.getBlockedUsers(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  sendFriendRequest,
  respondToFriendRequest,
  getFriendRequests,
  getFriends,
  blockUser,
  unblockUser,
  getBlockedUsers,
};