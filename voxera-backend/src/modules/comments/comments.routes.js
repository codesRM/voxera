const express             = require('express');
const router              = express.Router();
const Joi                 = require('joi');
const commentsController  = require('./comments.controller');
const { authenticate }    = require('../../middlewares/auth');
const validate            = require('../../middlewares/validate');

// Validation schemas
const createCommentSchema = Joi.object({
  body:      Joi.string().min(1).max(2000).required()
    .messages({
      'string.min':   'Comment cannot be empty',
      'string.max':   'Comment cannot exceed 2000 characters',
      'any.required': 'Comment body is required',
    }),
  parent_id: Joi.string().uuid().allow(null).optional(),
});

const updateCommentSchema = Joi.object({
  body: Joi.string().min(1).max(2000).required()
    .messages({
      'string.min':   'Comment cannot be empty',
      'string.max':   'Comment cannot exceed 2000 characters',
      'any.required': 'Comment body is required',
    }),
});

// GET  /api/posts/:postId/comments — get comments for a post
router.get('/posts/:postId/comments',
  commentsController.getPostComments
);

// POST /api/posts/:postId/comments — create comment
router.post('/posts/:postId/comments',
  authenticate,
  validate(createCommentSchema),
  commentsController.createComment
);

// PATCH /api/comments/:id — update comment
router.patch('/comments/:id',
  authenticate,
  validate(updateCommentSchema),
  commentsController.updateComment
);

// DELETE /api/comments/:id — delete comment
router.delete('/comments/:id',
  authenticate,
  commentsController.deleteComment
);

module.exports = router;