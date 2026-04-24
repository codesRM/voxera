const notificationsService = require('./notifications.service');

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await notificationsService.getNotifications(
      req.user.id,
      parseInt(page) || 1,
      parseInt(limit) || 20
    );
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationsService.getUnreadCount(req.user.id);
    res.status(200).json({ success: true, data: { count } });
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationsService.markAllRead(req.user.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (err) { next(err); }
};

const markOneRead = async (req, res, next) => {
  try {
    const result = await notificationsService.markOneRead(
      req.params.notificationId, req.user.id
    );
    res.status(200).json({ success: true, message: result.message });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, getUnreadCount, markAllRead, markOneRead };