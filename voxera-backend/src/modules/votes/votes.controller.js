const votesService = require('./votes.service');

const castVote = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;
    const { value } = req.body;

    const result = await votesService.castVote(
      req.user.id, targetType, targetId, value
    );

    res.status(200).json({
      success: true,
      message: 'Vote recorded',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { castVote };