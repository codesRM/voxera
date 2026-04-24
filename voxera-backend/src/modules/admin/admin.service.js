const db = require('../../config/db');

// ─── REPORTS MANAGEMENT ────────────────────────────────

// Get all reports (with filters)
const getAllReports = async ({ status, target_type, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      r.id, r.target_type, r.target_id, r.reason,
      r.description, r.status, r.created_at, r.reviewed_at,
      reporter.username AS reporter_username,
      reviewer.username AS reviewed_by_username
    FROM reports r
    JOIN users reporter ON reporter.id = r.reporter_id
    LEFT JOIN users reviewer ON reviewer.id = r.reviewed_by
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (status) {
    query += ` AND r.status = $${paramIndex++}`;
    params.push(status);
  }

  if (target_type) {
    query += ` AND r.target_type = $${paramIndex++}`;
    params.push(target_type);
  }

  query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await db.query(query, params);
  return result.rows;
};

// Review a report — update its status
const reviewReport = async (reportId, reviewerId, { status, note }) => {
  const existing = await db.query(
    'SELECT * FROM reports WHERE id = $1',
    [reportId]
  );

  if (existing.rows.length === 0) {
    const error = new Error('Report not found');
    error.statusCode = 404;
    throw error;
  }

  const result = await db.query(
    `UPDATE reports
     SET status      = $1,
         reviewed_by = $2,
         reviewed_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, reviewerId, reportId]
  );

  return result.rows[0];
};

// ─── USER MANAGEMENT ───────────────────────────────────

// Get all users (paginated)
const getAllUsers = async ({ page = 1, limit = 20, status, role }) => {
  const offset = (page - 1) * limit;

  let query = `
    SELECT id, username, email, display_name, role, status, created_at
    FROM users
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (status) {
    query += ` AND status = $${paramIndex++}`;
    params.push(status);
  }

  if (role) {
    query += ` AND role = $${paramIndex++}`;
    params.push(role);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await db.query(query, params);
  return result.rows;
};

// Ban a user
const banUser = async (targetUserId, adminId) => {
  // Can't ban yourself
  if (targetUserId === adminId) {
    const error = new Error('You cannot ban yourself');
    error.statusCode = 400;
    throw error;
  }

  const result = await db.query(
    `UPDATE users
     SET status = 'banned', updated_at = NOW()
     WHERE id = $1
     RETURNING id, username, status`,
    [targetUserId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

// Unban a user
const unbanUser = async (targetUserId) => {
  const result = await db.query(
    `UPDATE users
     SET status = 'active', updated_at = NOW()
     WHERE id = $1
     RETURNING id, username, status`,
    [targetUserId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

// Restrict a user
const restrictUser = async (targetUserId) => {
  const result = await db.query(
    `UPDATE users
     SET status = 'restricted', updated_at = NOW()
     WHERE id = $1
     RETURNING id, username, status`,
    [targetUserId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

// Change user role (promote/demote)
const changeUserRole = async (targetUserId, adminId, role) => {
  if (targetUserId === adminId) {
    const error = new Error('You cannot change your own role');
    error.statusCode = 400;
    throw error;
  }

  const result = await db.query(
    `UPDATE users
     SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, username, role`,
    [role, targetUserId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

// ─── POST MANAGEMENT ───────────────────────────────────

// Remove a post (mod/admin action)
const removePost = async (postId) => {
  const result = await db.query(
    `UPDATE posts
     SET status = 'removed', updated_at = NOW()
     WHERE id = $1 AND status = 'active'
     RETURNING id, title, status`,
    [postId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Post not found or already removed');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

// ─── DASHBOARD STATS ───────────────────────────────────

const getDashboardStats = async () => {
  const [users, posts, reports, newUsers] = await Promise.all([
    db.query(`SELECT COUNT(*) FROM users`),
    db.query(`SELECT COUNT(*) FROM posts WHERE status = 'active'`),
    db.query(`SELECT COUNT(*) FROM reports WHERE status = 'pending'`),
    db.query(`
      SELECT COUNT(*) FROM users 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `),
  ]);

  return {
    total_users:    parseInt(users.rows[0].count),
    total_posts:    parseInt(posts.rows[0].count),
    pending_reports: parseInt(reports.rows[0].count),
    new_users_7d:   parseInt(newUsers.rows[0].count),
  };
};

module.exports = {
  getAllReports,
  reviewReport,
  getAllUsers,
  banUser,
  unbanUser,
  restrictUser,
  changeUserRole,
  removePost,
  getDashboardStats,
};