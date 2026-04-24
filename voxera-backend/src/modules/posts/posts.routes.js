const express          = require('express');
const router           = express.Router();
const Joi              = require('joi');
const postsController  = require('./posts.controller');
const { authenticate, optionalAuthenticate } = require('../../middlewares/auth');
const validate         = require('../../middlewares/validate');

// Validation schemas
const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(300).required()
    .messages({
      'string.min':   'Title must be at least 3 characters',
      'string.max':   'Title cannot exceed 300 characters',
      'any.required': 'Title is required',
    }),
  body: Joi.string().max(10000).optional(),
});

const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(300).optional(),
  body:  Joi.string().max(10000).optional(),
});

const repostSchema = Joi.object({
  body: Joi.string().max(10000).optional(),
});

// GET  /api/posts           — get feed (public, but viewer-aware)
router.get('/',
  optionalAuthenticate,
  postsController.getFeed
);

// POST /api/posts           — create post (auth required)
router.post('/',
  authenticate,
  validate(createPostSchema),
  postsController.createPost
);

// GET  /api/posts/:id       — get single post (public)
router.get('/:id',
  postsController.getPostById
);

// PATCH /api/posts/:id      — update post (auth required)
router.patch('/:id',
  authenticate,
  validate(updatePostSchema),
  postsController.updatePost
);

// DELETE /api/posts/:id     — delete post (auth required)
router.delete('/:id',
  authenticate,
  postsController.deletePost
);

// POST /api/posts/:id/repost — repost (auth required)
router.post('/:id/repost',
  authenticate,
  validate(repostSchema),
  postsController.repost
);

module.exports = router;