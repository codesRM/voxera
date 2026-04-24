const express          = require('express');
const router           = express.Router();
const Joi              = require('joi');
const votesController  = require('./votes.controller');
const { authenticate } = require('../../middlewares/auth');
const validate         = require('../../middlewares/validate');

const voteSchema = Joi.object({
  value: Joi.string().valid('up', 'down').required()
    .messages({
      'any.only':     'Vote value must be either up or down',
      'any.required': 'Vote value is required',
    }),
});

// POST /api/votes/:targetType/:targetId
// targetType = post or comment
router.post('/:targetType/:targetId',
  authenticate,
  validate(voteSchema),
  votesController.castVote
);

module.exports = router;