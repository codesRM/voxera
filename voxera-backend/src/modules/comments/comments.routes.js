const express             = require('express');
const router              = express.Router();
const multer              = require('multer');
const path                = require('path');
const Joi                 = require('joi');
const commentsController  = require('./comments.controller');
const { authenticate }    = require('../../middlewares/auth');
const validate            = require('../../middlewares/validate');

// Multer config — images only, max 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Images only (jpeg, jpg, png, gif, webp)'));
  },
});

// Validation schemas
const createCommentSchema = Joi.object({
  body:      Joi.string().max(2000).optional().allow('', null),
  parent_id: Joi.string().uuid().allow(null, '').optional(),
});

const updateCommentSchema = Joi.object({
  body: Joi.string().min(1).max(2000).optional().allow(''),
});

// GET  /api/posts/:postId/comments
router.get('/posts/:postId/comments',
  commentsController.getPostComments
);

// POST /api/posts/:postId/comments — with optional image
router.post('/posts/:postId/comments',
  authenticate,
  upload.single('image'),
  validate(createCommentSchema),
  commentsController.createComment
);

// PATCH /api/comments/:id — with optional image
router.patch('/comments/:id',
  authenticate,
  upload.single('image'),
  validate(updateCommentSchema),
  commentsController.updateComment
);

// DELETE /api/comments/:id
router.delete('/comments/:id',
  authenticate,
  commentsController.deleteComment
);

module.exports = router;