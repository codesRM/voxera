const jwt = require('jsonwebtoken');
const env = require('../config/env');
const db  = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret);

    // Check if user still exists and is active
    const result = await db.query(
      'SELECT id, username, email, role, status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    const user = result.rows[0];

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned.',
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (err) {
    next(err);
  }
};

// Like `authenticate`, but does not reject anonymous requests. If a valid
// token is provided, `req.user` is attached; otherwise the request continues
// without it. Use this for endpoints that are public but personalize their
// response when the viewer is logged in (e.g. profile pages with `is_following`).
const optionalAuthenticate = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const result = await db.query(
      'SELECT id, username, email, role, status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length > 0 && result.rows[0].status !== 'banned') {
      req.user = result.rows[0];
    }
  } catch (_) {
    // Invalid/expired token on a public endpoint: fall through anonymously.
  }

  next();
};

module.exports = { authenticate, optionalAuthenticate };