const express           = require('express');
const router            = express.Router();
const Joi               = require('joi');
const adminController   = require('./admin.controller');
const { authenticate }  = require('../../middlewares/auth');
const { authorize }     = require('../../middlewares/rbac');
const validate          = require('../../middlewares/validate');

// All admin routes require auth + moderator or admin role
const isMod   = [authenticate, authorize('moderator')];
const isAdmin = [authenticate, authorize('admin')];

// Validation schemas
const reviewReportSchema = Joi.object({
  status: Joi.string()
    .valid('reviewed', 'action_taken', 'dismissed')
    .required(),
  note: Joi.string().max(500).optional(),
});

const changeRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'moderator', 'admin').required()
    .messages({ 'any.only': 'Role must be user, moderator, or admin' }),
});

// ─── DASHBOARD ─────────────────────────────────────────
// GET /api/admin/stats
router.get('/stats', ...isMod, adminController.getDashboardStats);

// ─── REPORTS ───────────────────────────────────────────
// GET   /api/admin/reports
// PATCH /api/admin/reports/:reportId
router.get('/reports',                  ...isMod, adminController.getAllReports);
router.patch('/reports/:reportId',
  ...isMod,
  validate(reviewReportSchema),
  adminController.reviewReport
);

// ─── USERS ─────────────────────────────────────────────
// GET    /api/admin/users
// POST   /api/admin/users/:userId/ban
// POST   /api/admin/users/:userId/unban
// POST   /api/admin/users/:userId/restrict
// PATCH  /api/admin/users/:userId/role
router.get('/users',                    ...isMod,   adminController.getAllUsers);
router.post('/users/:userId/ban',       ...isMod,   adminController.banUser);
router.post('/users/:userId/unban',     ...isMod,   adminController.unbanUser);
router.post('/users/:userId/restrict',  ...isMod,   adminController.restrictUser);
router.patch('/users/:userId/role',
  ...isAdmin,
  validate(changeRoleSchema),
  adminController.changeUserRole
);

// ─── POSTS ─────────────────────────────────────────────
// DELETE /api/admin/posts/:postId
router.delete('/posts/:postId', ...isMod, adminController.removePost);

module.exports = router;