const db = require('../../config/db');

const getUserByUsername = async (username, currentUserId) => {
  const result = await db.query(
    `SELECT 
      u.id, u.username, u.display_name, u.bio, u.avatar_url,
      u.role, u.status, u.created_at,
      COUNT(DISTINCT p.id)           AS post_count,
      COUNT(DISTINCT f1.follower_id) AS follower_count,
      COUNT(DISTINCT f2.followee_id) AS following_count
     FROM users u
     LEFT JOIN posts   p  ON p.author_id   = u.id AND p.status = 'active'
     LEFT JOIN follows f1 ON f1.followee_id = u.id
     LEFT JOIN follows f2 ON f2.follower_id = u.id
     WHERE u.username = $1
     GROUP BY u.id`,
    [username]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const user = result.rows[0];

  if (currentUserId) {
    // Check if blocked
    const blocked = await db.query(
      `SELECT 1 FROM blocks 
       WHERE blocker_id = $1 AND blocked_id = $2`,
      [user.id, currentUserId]
    );
    if (blocked.rows.length > 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if following
    const follows = await db.query(
      `SELECT 1 FROM follows 
       WHERE follower_id = $1 AND followee_id = $2`,
      [currentUserId, user.id]
    );
    user.is_following = follows.rows.length > 0;
  }

  return user;
};

const updateProfile = async (userId, { display_name, bio, avatar_url }) => {
  const result = await db.query(
    `UPDATE users
     SET display_name = COALESCE($1, display_name),
         bio          = COALESCE($2, bio),
         avatar_url   = COALESCE($3, avatar_url),
         updated_at   = NOW()
     WHERE id = $4
     RETURNING id, username, email, display_name, bio, avatar_url, role, status`,
    [display_name || null, bio || null, avatar_url || null, userId]
  );

  return result.rows[0];
};

const searchUsers = async (query, currentUserId) => {
  if (!query || query.trim().length < 2) return [];

  const result = await db.query(
    `SELECT 
      u.id, u.username, u.display_name, u.avatar_url, u.role
     FROM users u
     WHERE u.username ILIKE $1
       AND u.status = 'active'
       AND ($2::uuid IS NULL OR u.id != $2)
       AND ($2::uuid IS NULL OR u.id NOT IN (
         SELECT blocked_id FROM blocks WHERE blocker_id = $2
         UNION
         SELECT blocker_id FROM blocks WHERE blocked_id = $2
       ))
     LIMIT 20`,
    [`%${query.trim()}%`, currentUserId]
  );

  return result.rows;
};

const getUserPosts = async (username, currentUserId) => {
  const userResult = await db.query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );

  if (userResult.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const userId = userResult.rows[0].id;

  const result = await db.query(
    `SELECT 
      p.id, p.title, p.body, p.vote_count, p.created_at,
      u.username, u.display_name, u.avatar_url
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.author_id = $1
       AND p.status = 'active'
     ORDER BY p.created_at DESC
     LIMIT 20`,
    [userId]
  );

  return result.rows;
};

module.exports = {
  getUserByUsername,
  updateProfile,
  searchUsers,
  getUserPosts,
};