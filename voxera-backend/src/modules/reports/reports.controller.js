const reportsService = require('./reports.service');

const createReport = async (req, res, next) => {
  try {
    const { target_type, target_id, reason, description } = req.body;
    const report = await reportsService.createReport(req.user.id, {
      target_type,
      target_id,
      reason,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const data = await reportsService.getMyReports(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReport, getMyReports };