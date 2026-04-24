const searchService = require('./search.service');

const search = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const currentUserId = req.user?.id || null;
    const results = await searchService.search(q.trim(), currentUserId);

    res.status(200).json({
      success: true,
      query: q.trim(),
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { search };