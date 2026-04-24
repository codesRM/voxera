const express                   = require('express');
const router                    = express.Router();
const notificationsController   = require('./notifications.controller');
const { authenticate }          = require('../../middlewares/auth');

// GET  /api/notifications          — get all notifications
// GET  /api/notifications/unread   — get unread count
// PUT  /api/notifications/read-all — mark all read
// PUT  /api/notifications/:id/read — mark one read

router.get('/',           authenticate, notificationsController.getNotifications);
router.get('/unread',     authenticate, notificationsController.getUnreadCount);
router.put('/read-all',   authenticate, notificationsController.markAllRead);
router.put('/:notificationId/read', authenticate, notificationsController.markOneRead);

module.exports = router;