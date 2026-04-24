const express        = require('express');
const router         = express.Router();
const Joi            = require('joi');
const authController = require('./auth.controller');
const validate       = require('../../middlewares/validate');
const { authenticate }  = require('../../middlewares/auth');
const { authLimiter }   = require('../../middlewares/rateLimiter');

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min':      'Username must be at least 3 characters',
      'string.max':      'Username cannot exceed 30 characters',
      'any.required':    'Username is required',
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email':  'Please provide a valid email',
      'any.required':  'Email is required',
    }),
  password: Joi.string().min(8).max(100).required()
    .messages({
      'string.min':   'Password must be at least 8 characters',
      'string.max':   'Password cannot exceed 100 characters',
      'any.required': 'Password is required',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email':  'Please provide a valid email',
      'any.required':  'Email is required',
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// Routes
// POST /api/auth/register
router.post('/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

// POST /api/auth/login
router.post('/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

// POST /api/auth/logout
router.post('/logout',
  authenticate,
  authController.logout
);

// GET /api/auth/me
router.get('/me',
  authenticate,
  authController.getMe
);

module.exports = router;