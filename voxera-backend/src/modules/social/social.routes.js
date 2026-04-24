const express           = require('express');
const router            = express.Router();
const Joi               = require('joi');
const socialController  = require('./social.controller');
const { authenticate }  = require('../../middlewares/auth');
const validate          = require('../../middlewares/validate');

const respondSchema = Joi.object({
  status: Joi.string().valid('accepted', 'rejected').required()
    .messages({
      'any.only':     'Status must be accepted or rejected',
      'any.required': 'Status is required',
    }),
});

// ─── FOLLOWS ───────────────────────────────────────────
// POST   /api/social/follow/:userId
// DELETE /api/social/follow/:userId
// GET    /api/social/:userId/followers
// GET    /api/social/:userId/following

router.post('/follow/:userId',    authenticate, socialController.followUser);
router.delete('/follow/:userId',  authenticate, socialController.unfollowUser);
router.get('/:userId/followers',  socialController.getFollowers);
router.get('/:userId/following',  socialController.getFollowing);

// ─── FRIEND REQUESTS ───────────────────────────────────
// POST   /api/social/friends/request/:userId
// PATCH  /api/social/friends/request/:requestId
// GET    /api/social/friends/requests
// GET    /api/social/friends

router.post('/friends/request/:userId',
  authenticate,
  socialController.sendFriendRequest
);

router.patch('/friends/request/:requestId',
  authenticate,
  validate(respondSchema),
  socialController.respondToFriendRequest
);

router.get('/friends/requests',  authenticate, socialController.getFriendRequests);
router.get('/friends',           authenticate, socialController.getFriends);

// ─── BLOCKS ────────────────────────────────────────────
// POST   /api/social/block/:userId
// DELETE /api/social/block/:userId
// GET    /api/social/blocked

router.post('/block/:userId',   authenticate, socialController.blockUser);
router.delete('/block/:userId', authenticate, socialController.unblockUser);
router.get('/blocked',          authenticate, socialController.getBlockedUsers);

module.exports = router;