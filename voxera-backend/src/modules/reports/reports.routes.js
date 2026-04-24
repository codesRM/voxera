const express             = require('express');
const router              = express.Router();
const Joi                 = require('joi');
const reportsController   = require('./reports.controller');
const { authenticate }    = require('../../middlewares/auth');
const validate            = require('../../middlewares/validate');

const reportSchema = Joi.object({
  target_type: Joi.string().valid('post', 'user').required()
    .messages({
      'any.only':     'Target type must be post or user',
      'any.required': 'Target type is required',
    }),
  target_id: Joi.string().uuid().required()
    .messages({
      'any.required': 'Target ID is required',
    }),
  reason: Joi.string().min(3).max(100).required()
    .messages({
      'string.min':   'Reason must be at least 3 characters',
      'any.required': 'Reason is required',
    }),
  description: Joi.string().max(500).optional(),
});

// POST /api/reports       — submit a report
router.post('/',
  authenticate,
  validate(reportSchema),
  reportsController.createReport
);

// GET  /api/reports/mine  — get your own reports
router.get('/mine',
  authenticate,
  reportsController.getMyReports
);

module.exports = router;