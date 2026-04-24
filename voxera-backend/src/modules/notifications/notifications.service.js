const db = require('../../config/db');

// Get all notifications for a user
const getNotifications = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const result = await db.query(
    `SELECT 
      n.id, n.type, n.message, n.is_read, n.created_at,
      n.target_id, n.target_type,
      u.username AS actor_username,
      u.avatar_url AS actor_avatar
     FROM notifications n
     JOIN users u ON u.id = n.actor_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

// Get unread count
const getUnreadCount = async (userId) => {
  const result = await db.query(
    `SELECT COUNT(*) FROM notifications 
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return parseInt(result.rows[0].count);
};

// Mark all as read
const markAllRead = async (userId) => {
  await db.query(
    `UPDATE notifications SET is_read = true 
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return { message: 'All notifications marked as read' };
};

// Mark single as read
const markOneRead = async (notificationId, userId) => {
  await db.query(
    `UPDATE notifications SET is_read = true 
     WHERE id = $1 AND user_id = $2`,
    [notificationId, userId]
  );
  return { message: 'Notification marked as read' };
};

// Create a notification (internal use)
const createNotification = async ({ userId, actorId, type, targetId, targetType, message }) => {
  // Don't notify yourself
  if (userId === actorId) return;

  await db.query(
    `INSERT INTO notifications (user_id, actor_id, type, target_id, target_type, message)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, actorId, type, targetId || null, targetType || null, message]
  );
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  createNotification,
};