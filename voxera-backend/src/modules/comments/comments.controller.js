const commentsService = require('./comments.service');

const createComment = async (req, res, next) => {
  try {
    const { body, parent_id } = req.body;
    const { postId } = req.params;

    // Handle image upload
    let image_url = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      image_url = `data:${req.file.mimetype};base64,${base64}`;
    }

    const comment = await commentsService.createComment(
      req.user.id, postId, { body, parent_id, image_url }
    );

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || null;
    const comments = await commentsService.getPostComments(
      req.params.postId, currentUserId
    );

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (err) {
    next(err);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { body } = req.body;

    // Handle image upload
    let image_url = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      image_url = `data:${req.file.mimetype};base64,${base64}`;
    }

    const comment = await commentsService.updateComment(
      req.params.id, req.user.id, { body, image_url }
    );

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const result = await commentsService.deleteComment(
      req.params.id, req.user.id, req.user.role
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
};