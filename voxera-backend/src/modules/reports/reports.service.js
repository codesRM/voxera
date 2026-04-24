const db = require('../../config/db');

// Submit a report
const createReport = async (reporterId, { target_type, target_id, reason, description }) => {
  // Check target exists
  const table = target_type === 'post' ? 'posts' : 'users';
  const target = await db.query(
    `SELECT id FROM ${table} WHERE id = $1`,
    [target_id]
  );

  if (target.rows.length === 0) {
    const error = new Error(`${target_type} not found`);
    error.statusCode = 404;
    throw error;
  }

  // Can't report yourself
  if (target_type === 'user' && target_id === reporterId) {
    const error = new Error('You cannot report yourself');
    error.statusCode = 400;
    throw error;
  }

  const result = await db.query(
    `INSERT INTO reports (reporter_id, target_type, target_id, reason, description)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (reporter_id, target_type, target_id) DO NOTHING
     RETURNING *`,
    [reporterId, target_type, target_id, reason, description || null]
  );

  if (result.rows.length === 0) {
    const error = new Error('You have already reported this');
    error.statusCode = 409;
    throw error;
  }

  return result.rows[0];
};

// Get own submitted reports
const getMyReports = async (userId) => {
  const result = await db.query(
    `SELECT 
      r.id, r.target_type, r.target_id, r.reason,
      r.description, r.status, r.created_at
     FROM reports r
     WHERE r.reporter_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );

  return result.rows;
};

module.exports = { createReport, getMyReports };