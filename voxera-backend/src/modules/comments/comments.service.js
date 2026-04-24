const db = require('../../config/db');
const { createNotification } = require('../notifications/notifications.service');

// Create a comment
const createComment = async (authorId, postId, { body, parent_id }) => {
  // Check post exists
  const post = await db.query(
    'SELECT id, author_id, title FROM posts WHERE id = $1 AND status = $2',
    [postId, 'active']
  );

  if (post.rows.length === 0) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  // If reply, check parent comment exists
  if (parent_id) {
    const parent = await db.query(
      'SELECT id FROM comments WHERE id = $1 AND is_deleted = false',
      [parent_id]
    );
    if (parent.rows.length === 0) {
      const error = new Error('Parent comment not found');
      error.statusCode = 404;
      throw error;
    }
  }

  const result = await db.query(
    `INSERT INTO comments (post_id, author_id, body, parent_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [postId, authorId, body, parent_id || null]
  );

  // Get commenter username for notification
  const commenter = await db.query(
    'SELECT username FROM users WHERE id = $1',
    [authorId]
  );

  // Notify the post author (only if commenter is not the post author)
  if (post.rows[0].author_id !== authorId) {
    await createNotification({
      userId:     post.rows[0].author_id,
      actorId:    authorId,
      type:       'comment',
      targetId:   postId,
      targetType: 'post',
      message:    `${commenter.rows[0].username} commented on your post`,
    });
  }

  return result.rows[0];
};

// Get comments for a post
const getPostComments = async (postId, currentUserId) => {
  const result = await db.query(
    `SELECT
      c.id, c.body, c.parent_id, c.vote_count, c.created_at,
      u.id AS author_id, u.username, u.display_name, u.avatar_url,
      CASE WHEN v.user_id IS NOT NULL THEN v.value ELSE NULL END AS user_vote
     FROM comments c
     JOIN users u ON u.id = c.author_id
     LEFT JOIN votes v ON v.target_id = c.id
       AND v.target_type = 'comment'
       AND v.user_id = $2
     WHERE c.post_id = $1
       AND c.is_deleted = false
     ORDER BY c.created_at ASC`,
    [postId, currentUserId]
  );

  return result.rows;
};

// Update a comment
const updateComment = async (commentId, userId, { body }) => {
  const existing = await db.query(
    'SELECT * FROM comments WHERE id = $1 AND is_deleted = false',
    [commentId]
  );

  if (existing.rows.length === 0) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  if (existing.rows[0].author_id !== userId) {
    const error = new Error('You can only edit your own comments');
    error.statusCode = 403;
    throw error;
  }

  const result = await db.query(
    `UPDATE comments
     SET body = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [body, commentId]
  );

  return result.rows[0];
};

// Delete a comment (soft delete)
const deleteComment = async (commentId, userId, userRole) => {
  const existing = await db.query(
    'SELECT * FROM comments WHERE id = $1 AND is_deleted = false',
    [commentId]
  );

  if (existing.rows.length === 0) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  const isModOrAdmin = ['admin', 'moderator'].includes(userRole);
  if (existing.rows[0].author_id !== userId && !isModOrAdmin) {
    const error = new Error('You can only delete your own comments');
    error.statusCode = 403;
    throw error;
  }

  await db.query(
    `UPDATE comments 
     SET is_deleted = true, updated_at = NOW() 
     WHERE id = $1`,
    [commentId]
  );

  return { message: 'Comment deleted successfully' };
};

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
};