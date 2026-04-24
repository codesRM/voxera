const postsService = require('./posts.service');

const createPost = async (req, res, next) => {
  try {
    const { title, body } = req.body;
    const post = await postsService.createPost(req.user.id, { title, body });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

const getFeed = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || null;
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const filter = req.query.filter === 'following' ? 'following' : undefined;
    const sort   = req.query.sort === 'trending' ? 'trending' : undefined;

    const posts = await postsService.getFeed(currentUserId, { page, limit, filter, sort });

    res.status(200).json({
      success: true,
      data: posts,
      meta: { page, limit, filter, sort },
    });
  } catch (err) {
    next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || null;
    const post = await postsService.getPostById(req.params.id, currentUserId);

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { title, body } = req.body;
    const post = await postsService.updatePost(
      req.params.id,
      req.user.id,
      { title, body }
    );

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const result = await postsService.deletePost(
      req.params.id,
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

const repost = async (req, res, next) => {
  try {
    const { body } = req.body;
    const post = await postsService.repost(
      req.user.id,
      req.params.id,
      { body }
    );

    res.status(201).json({
      success: true,
      message: 'Reposted successfully',
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  repost,
};