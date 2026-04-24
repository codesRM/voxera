const db = require('../../config/db');
const { createNotification } = require('../notifications/notifications.service');

// ─── FOLLOWS ───────────────────────────────────────────

// Follow a user
const followUser = async (followerId, followeeId) => {
  if (followerId === followeeId) {
    const error = new Error('You cannot follow yourself');
    error.statusCode = 400;
    throw error;
  }

  // Check target user exists
  const user = await db.query(
    'SELECT id FROM users WHERE id = $1 AND status = $2',
    [followeeId, 'active']
  );
  if (user.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if blocked
  const blocked = await db.query(
    `SELECT 1 FROM blocks
     WHERE (blocker_id = $1 AND blocked_id = $2)
        OR (blocker_id = $2 AND blocked_id = $1)`,
    [followerId, followeeId]
  );
  if (blocked.rows.length > 0) {
    const error = new Error('Cannot follow this user');
    error.statusCode = 403;
    throw error;
  }

  // Insert follow (ignore if already following)
  const inserted = await db.query(
    `INSERT INTO follows (follower_id, followee_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING follower_id`,
    [followerId, followeeId]
  );

  // Only notify when a new follow row was actually written, so un/re-following
  // doesn't spam duplicate notifications.
  if (inserted.rows.length > 0) {
    const follower = await db.query(
      'SELECT username FROM users WHERE id = $1',
      [followerId]
    );
    await createNotification({
      userId:     followeeId,
      actorId:    followerId,
      type:       'follow',
      targetId:   followerId,
      targetType: 'user',
      message:    `${follower.rows[0].username} started following you`,
    });
  }

  return { message: 'User followed successfully' };
};

// Unfollow a user
const unfollowUser = async (followerId, followeeId) => {
  await db.query(
    `DELETE FROM follows 
     WHERE follower_id = $1 AND followee_id = $2`,
    [followerId, followeeId]
  );

  return { message: 'User unfollowed successfully' };
};

// Get followers of a user
const getFollowers = async (userId) => {
  const result = await db.query(
    `SELECT u.id, u.username, u.display_name, u.avatar_url
     FROM follows f
     JOIN users u ON u.id = f.follower_id
     WHERE f.followee_id = $1
       AND u.status = 'active'
     ORDER BY f.created_at DESC`,
    [userId]
  );

  return result.rows;
};

// Get users that a user is following
const getFollowing = async (userId) => {
  const result = await db.query(
    `SELECT u.id, u.username, u.display_name, u.avatar_url
     FROM follows f
     JOIN users u ON u.id = f.followee_id
     WHERE f.follower_id = $1
       AND u.status = 'active'
     ORDER BY f.created_at DESC`,
    [userId]
  );

  return result.rows;
};

// ─── FRIEND REQUESTS ───────────────────────────────────

// Send a friend request
const sendFriendRequest = async (senderId, receiverId) => {
  if (senderId === receiverId) {
    const error = new Error('You cannot send a friend request to yourself');
    error.statusCode = 400;
    throw error;
  }

  // Check target user exists
  const user = await db.query(
    'SELECT id FROM users WHERE id = $1 AND status = $2',
    [receiverId, 'active']
  );
  if (user.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if blocked
  const blocked = await db.query(
    `SELECT 1 FROM blocks 
     WHERE (blocker_id = $1 AND blocked_id = $2)
        OR (blocker_id = $2 AND blocked_id = $1)`,
    [senderId, receiverId]
  );
  if (blocked.rows.length > 0) {
    const error = new Error('Cannot send friend request to this user');
    error.statusCode = 403;
    throw error;
  }

  // Check if request already exists in either direction
  const existing = await db.query(
    `SELECT * FROM friend_requests
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)`,
    [senderId, receiverId]
  );

  if (existing.rows.length > 0) {
    const req = existing.rows[0];
    if (req.status === 'accepted') {
      const error = new Error('You are already friends');
      error.statusCode = 409;
      throw error;
    }
    if (req.status === 'pending') {
      const error = new Error('A friend request already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  const result = await db.query(
    `INSERT INTO friend_requests (sender_id, receiver_id)
     VALUES ($1, $2)
     RETURNING *`,
    [senderId, receiverId]
  );

  return result.rows[0];
};

// Respond to a friend request (accept or reject)
const respondToFriendRequest = async (requestId, receiverId, status) => {
  const existing = await db.query(
    `SELECT * FROM friend_requests 
     WHERE id = $1 AND receiver_id = $2 AND status = 'pending'`,
    [requestId, receiverId]
  );

  if (existing.rows.length === 0) {
    const error = new Error('Friend request not found');
    error.statusCode = 404;
    throw error;
  }

  const result = await db.query(
    `UPDATE friend_requests
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, requestId]
  );

  return result.rows[0];
};

// Get all friend requests (received, pending)
const getFriendRequests = async (userId) => {
  const result = await db.query(
    `SELECT 
      fr.id, fr.status, fr.created_at,
      u.id AS sender_id, u.username, u.display_name, u.avatar_url
     FROM friend_requests fr
     JOIN users u ON u.id = fr.sender_id
     WHERE fr.receiver_id = $1
       AND fr.status = 'pending'
     ORDER BY fr.created_at DESC`,
    [userId]
  );

  return result.rows;
};

// Get accepted friends list
const getFriends = async (userId) => {
  const result = await db.query(
    `SELECT 
      u.id, u.username, u.display_name, u.avatar_url
     FROM friend_requests fr
     JOIN users u ON (
       CASE 
         WHEN fr.sender_id = $1 THEN u.id = fr.receiver_id
         ELSE u.id = fr.sender_id
       END
     )
     WHERE (fr.sender_id = $1 OR fr.receiver_id = $1)
       AND fr.status = 'accepted'
       AND u.status = 'active'
     ORDER BY u.username ASC`,
    [userId]
  );

  return result.rows;
};

// ─── BLOCKS ────────────────────────────────────────────

// Block a user
const blockUser = async (blockerId, blockedId) => {
  if (blockerId === blockedId) {
    const error = new Error('You cannot block yourself');
    error.statusCode = 400;
    throw error;
  }

  // Insert block
  await db.query(
    `INSERT INTO blocks (blocker_id, blocked_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [blockerId, blockedId]
  );

  // Also remove any existing follows in both directions
  await db.query(
    `DELETE FROM follows 
     WHERE (follower_id = $1 AND followee_id = $2)
        OR (follower_id = $2 AND followee_id = $1)`,
    [blockerId, blockedId]
  );

  // Cancel any pending friend requests
  await db.query(
    `DELETE FROM friend_requests
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)`,
    [blockerId, blockedId]
  );

  return { message: 'User blocked successfully' };
};

// Unblock a user
const unblockUser = async (blockerId, blockedId) => {
  await db.query(
    `DELETE FROM blocks 
     WHERE blocker_id = $1 AND blocked_id = $2`,
    [blockerId, blockedId]
  );

  return { message: 'User unblocked successfully' };
};

// Get blocked users list
const getBlockedUsers = async (userId) => {
  const result = await db.query(
    `SELECT u.id, u.username, u.display_name, u.avatar_url, b.created_at AS blocked_at
     FROM blocks b
     JOIN users u ON u.id = b.blocked_id
     WHERE b.blocker_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );

  return result.rows;
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