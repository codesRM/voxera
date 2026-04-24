const db = require('../../config/db');

// Cast or update a vote
const castVote = async (userId, targetType, targetId, value) => {
  // Check target exists
  const table = targetType === 'post' ? 'posts' : 'comments';
  const statusField = targetType === 'post' ? 'status' : 'is_deleted';
  const statusValue = targetType === 'post' ? 'active' : false;

  const target = await db.query(
    `SELECT id FROM ${table} WHERE id = $1 AND ${statusField} = $2`,
    [targetId, statusValue]
  );

  if (target.rows.length === 0) {
    const error = new Error(`${targetType} not found`);
    error.statusCode = 404;
    throw error;
  }

  // Check existing vote
  const existing = await db.query(
    `SELECT * FROM votes 
     WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
    [userId, targetType, targetId]
  );

  let voteDiff = 0;

  if (existing.rows.length > 0) {
    const oldValue = existing.rows[0].value;

    // Same vote — remove it (toggle off)
    if (oldValue === value) {
      await db.query(
        `DELETE FROM votes 
         WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
        [userId, targetType, targetId]
      );
      voteDiff = value === 'up' ? -1 : 1;

    } else {
      // Different vote — update it
      await db.query(
        `UPDATE votes SET value = $1 
         WHERE user_id = $2 AND target_type = $3 AND target_id = $4`,
        [value, userId, targetType, targetId]
      );
      voteDiff = value === 'up' ? 2 : -2;
    }
  } else {
    // New vote
    await db.query(
      `INSERT INTO votes (user_id, target_type, target_id, value)
       VALUES ($1, $2, $3, $4)`,
      [userId, targetType, targetId, value]
    );
    voteDiff = value === 'up' ? 1 : -1;
  }

  // Update vote count on target
  await db.query(
    `UPDATE ${table} 
     SET vote_count = vote_count + $1 
     WHERE id = $2`,
    [voteDiff, targetId]
  );

  // Return updated vote count
  const updated = await db.query(
    `SELECT vote_count FROM ${table} WHERE id = $1`,
    [targetId]
  );

  return { vote_count: updated.rows[0].vote_count };
};

module.exports = { castVote };