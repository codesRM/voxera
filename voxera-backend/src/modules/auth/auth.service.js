const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../../config/db');
const env    = require('../../config/env');

// Register a new user
const register = async ({ username, email, password }) => {
  const emailExists = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (emailExists.rows.length > 0) {
    const error = new Error('Email already in use');
    error.statusCode = 409;
    throw error;
  }

  const usernameExists = await db.query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );
  if (usernameExists.rows.length > 0) {
    const error = new Error('Username already taken');
    error.statusCode = 409;
    throw error;
  }

  const salt         = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const result = await db.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, role, status, created_at`,
    [username, email, passwordHash]
  );

  const user  = result.rows[0];
  const token = generateToken(user);

  return { user, token };
};

// Login existing user
const login = async ({ email, password }) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  if (user.status === 'banned') {
    const error = new Error('Your account has been banned');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);
  const { password_hash, ...safeUser } = user;

  return { user: safeUser, token };
};

// Get current logged in user
const getMe = async (userId) => {
  const result = await db.query(
    `SELECT id, username, email, display_name, bio, 
            avatar_url, role, status, created_at 
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

// ✅ NEW — Check username availability
const checkUsername = async (username) => {
  const result = await db.query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );
  return { available: result.rows.length === 0 };
};

// ✅ NEW — Check email availability
const checkEmail = async (email) => {
  const result = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  return { available: result.rows.length === 0 };
};

// Helper — generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

module.exports = { register, login, getMe, checkUsername, checkEmail };