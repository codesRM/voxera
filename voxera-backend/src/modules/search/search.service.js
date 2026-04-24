const db = require('../../config/db');

const search = async (query, currentUserId) => {
  const keyword = `%${query}%`;

  // Search posts by title or body
  const posts = await db.query(
    `SELECT 
      p.id, p.title, p.body, p.vote_count, p.created_at,
      u.id AS author_id, u.username, u.display_name, u.avatar_url,
      COUNT(DISTINCT c.id) AS comment_count
     FROM posts p
     JOIN users u ON u.id = p.author_id
     LEFT JOIN comments c ON c.post_id = p.id AND c.is_deleted = false
     WHERE p.status = 'active'
       AND u.status = 'active'
       AND (
         p.title ILIKE $1
         OR p.body  ILIKE $1
       )
       AND ($2::uuid IS NULL OR p.author_id NOT IN (
         SELECT blocked_id FROM blocks WHERE blocker_id = $2
         UNION
         SELECT blocker_id FROM blocks WHERE blocked_id = $2
       ))
     GROUP BY p.id, u.id
     ORDER BY p.created_at DESC
     LIMIT 20`,
    [keyword, currentUserId]
  );

  // Search users by username or display_name
  const users = await db.query(
    `SELECT 
      u.id, u.username, u.display_name, u.avatar_url, u.bio,
      COUNT(DISTINCT f.follower_id) AS follower_count
     FROM users u
     LEFT JOIN follows f ON f.followee_id = u.id
     WHERE u.status = 'active'
       AND (
         u.username     ILIKE $1
         OR u.display_name ILIKE $1
       )
       AND ($2::uuid IS NULL OR u.id NOT IN (
         SELECT blocked_id FROM blocks WHERE blocker_id = $2
         UNION
         SELECT blocker_id FROM blocks WHERE blocked_id = $2
       ))
     GROUP BY u.id
     ORDER BY u.username ASC
     LIMIT 10`,
    [keyword, currentUserId]
  );

  return {
    posts: posts.rows,
    users: users.rows,
    total: posts.rows.length + users.rows.length,
  };
};

module.exports = { search };