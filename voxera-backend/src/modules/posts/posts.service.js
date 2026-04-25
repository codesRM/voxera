const db = require('../../config/db');
const { createNotification } = require('../notifications/notifications.service');

// Create a new post
const createPost = async (authorId, { title, body, image_url }) => {
  const result = await db.query(
    `INSERT INTO posts (author_id, title, body, image_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [authorId, title, body || null, image_url || null] // ✅ FIXED: was missing image_url value
  );

  const post = result.rows[0];

  const authorResult = await db.query(
    'SELECT username FROM users WHERE id = $1',
    [authorId]
  );
  const authorUsername = authorResult.rows[0]?.username || 'Someone';

  const followers = await db.query(
    `SELECT follower_id FROM follows WHERE followee_id = $1`,
    [authorId]
  );

  for (const row of followers.rows) {
    await createNotification({
      userId:     row.follower_id,
      actorId:    authorId,
      type:       'new_post',
      targetId:   post.id,
      targetType: 'post',
      message:    `${authorUsername} published a new post: "${title}"`,
    });
  }

  return post;
};

// Get all posts (main feed)
const getFeed = async (currentUserId, { page = 1, limit = 20, filter, sort } = {}) => {
  if (filter === 'following' && !currentUserId) {
    return [];
  }

  const offset = (page - 1) * limit;

  const followingClause = filter === 'following'
    ? `AND p.author_id IN (SELECT followee_id FROM follows WHERE follower_id = $1)`
    : '';

  const trendingWindow = sort === 'trending'
    ? `AND p.created_at > NOW() - INTERVAL '7 days'`
    : '';
  const orderBy = sort === 'trending'
    ? `(COALESCE(p.vote_count, 0) * 2 + COUNT(DISTINCT c.id)) DESC, p.created_at DESC`
    : `p.created_at DESC`;

  const result = await db.query(
    `SELECT
      p.id, p.title, p.body, p.image_url, p.vote_count, p.created_at,
      u.id AS author_id, u.username, u.display_name, u.avatar_url,
      COUNT(DISTINCT c.id) AS comment_count,
      CASE WHEN v.user_id IS NOT NULL THEN v.value ELSE NULL END AS user_vote
     FROM posts p
     JOIN users u ON u.id = p.author_id
     LEFT JOIN comments c ON c.post_id = p.id AND c.is_deleted = false
     LEFT JOIN votes v ON v.target_id = p.id
       AND v.target_type = 'post'
       AND v.user_id = $1
     WHERE p.status = 'active'
       AND u.status = 'active'
       ${followingClause}
       ${trendingWindow}
       AND ($1::uuid IS NULL OR p.author_id NOT IN (
         SELECT blocked_id FROM blocks WHERE blocker_id = $1
         UNION
         SELECT blocker_id FROM blocks WHERE blocked_id = $1
       ))
     GROUP BY p.id, u.id, v.user_id, v.value
     ORDER BY ${orderBy}
     LIMIT $2 OFFSET $3`,
    [currentUserId, limit, offset]
  );

  return result.rows;
};

// Get single post by id
const getPostById = async (postId, currentUserId) => {
  const result = await db.query(
    `SELECT 
      p.id, p.title, p.body, p.image_url, p.vote_count, p.created_at, p.updated_at,
      u.id AS author_id, u.username, u.display_name, u.avatar_url,
      COUNT(DISTINCT c.id) AS comment_count,
      CASE WHEN v.user_id IS NOT NULL THEN v.value ELSE NULL END AS user_vote
     FROM posts p
     JOIN users u ON u.id = p.author_id
     LEFT JOIN comments c ON c.post_id = p.id AND c.is_deleted = false
     LEFT JOIN votes v ON v.target_id = p.id 
       AND v.target_type = 'post' 
       AND v.user_id = $2
     WHERE p.id = $1
       AND p.status = 'active'
     GROUP BY p.id, u.id, v.user_id, v.value`,
    [postId, currentUserId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

// Update a post
const updatePost = async (postId, userId, { title, body, image_url }) => {
  const existing = await db.query(
    'SELECT * FROM posts WHERE id = $1 AND status = $2',
    [postId, 'active']
  );

  if (existing.rows.length === 0) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  if (existing.rows[0].author_id !== userId) {
    const error = new Error('You can only edit your own posts');
    error.statusCode = 403;
    throw error;
  }

  const result = await db.query(
    `UPDATE posts
     SET title      = COALESCE($1, title),
         body       = COALESCE($2, body),
         image_url  = COALESCE($3, image_url),
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [title || null, body || null, image_url || null, postId]
  );

  return result.rows[0];
};

// Delete a post (soft delete)
const deletePost = async (postId, userId, userRole) => {
  const existing = await db.query(
    'SELECT * FROM posts WHERE id = $1 AND status = $2',
    [postId, 'active']
  );

  if (existing.rows.length === 0) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }

  const isModOrAdmin = ['admin', 'moderator'].includes(userRole);
  if (existing.rows[0].author_id !== userId && !isModOrAdmin) {
    const error = new Error('You can only delete your own posts');
    error.statusCode = 403;
    throw error;
  }

  const status = isModOrAdmin && existing.rows[0].author_id !== userId
    ? 'removed'
    : 'deleted';

  await db.query(
    `UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2`,
    [status, postId]
  );

  return { message: 'Post deleted successfully' };
};

// Repost
const repost = async (userId, originalPostId, { body }) => {
  const original = await db.query(
    'SELECT * FROM posts WHERE id = $1 AND status = $2',
    [originalPostId, 'active']
  );

  if (original.rows.length === 0) {
    const error = new Error('Original post not found');
    error.statusCode = 404;
    throw error;
  }

  const alreadyReposted = await db.query(
    `SELECT id FROM posts 
     WHERE author_id = $1 AND original_post_id = $2`,
    [userId, originalPostId]
  );

  if (alreadyReposted.rows.length > 0) {
    const error = new Error('You already reposted this');
    error.statusCode = 409;
    throw error;
  }

  const result = await db.query(
    `INSERT INTO posts (author_id, title, body, original_post_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, original.rows[0].title, body || null, originalPostId]
  );

  return result.rows[0];
};

module.exports = {
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  repost,
};