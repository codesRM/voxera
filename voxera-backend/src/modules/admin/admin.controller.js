const adminService = require('./admin.service');

const getDashboardStats = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardStats();
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getAllReports = async (req, res, next) => {
  try {
    const { status, target_type, page, limit } = req.query;
    const data = await adminService.getAllReports({
      status, target_type,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const reviewReport = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const data = await adminService.reviewReport(
      req.params.reportId, req.user.id, { status, note }
    );
    res.status(200).json({
      success: true,
      message: 'Report reviewed',
      data,
    });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { status, role, page, limit } = req.query;
    const data = await adminService.getAllUsers({
      status, role,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const banUser = async (req, res, next) => {
  try {
    const data = await adminService.banUser(req.params.userId, req.user.id);
    res.status(200).json({ success: true, message: 'User banned', data });
  } catch (err) { next(err); }
};

const unbanUser = async (req, res, next) => {
  try {
    const data = await adminService.unbanUser(req.params.userId);
    res.status(200).json({ success: true, message: 'User unbanned', data });
  } catch (err) { next(err); }
};

const restrictUser = async (req, res, next) => {
  try {
    const data = await adminService.restrictUser(req.params.userId);
    res.status(200).json({ success: true, message: 'User restricted', data });
  } catch (err) { next(err); }
};

const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const data = await adminService.changeUserRole(
      req.params.userId, req.user.id, role
    );
    res.status(200).json({ success: true, message: 'Role updated', data });
  } catch (err) { next(err); }
};

const removePost = async (req, res, next) => {
  try {
    const data = await adminService.removePost(req.params.postId);
    res.status(200).json({ success: true, message: 'Post removed', data });
  } catch (err) { next(err); }
};

module.exports = {
  getDashboardStats,
  getAllReports,
  reviewReport,
  getAllUsers,
  banUser,
  unbanUser,
  restrictUser,
  changeUserRole,
  removePost,
};