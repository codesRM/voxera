const usersService = require('./users.service');

const getUserProfile = async (req, res, next) => {
  try {
    const data = await usersService.getUserByUsername(
      req.params.username,
      req.user?.id || null
    );
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getUserPosts = async (req, res, next) => {
  try {
    const data = await usersService.getUserPosts(
      req.params.username,
      req.user?.id || null
    );
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const data = await usersService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const searchUsers = async (req, res, next) => {
  try {
    const data = await usersService.searchUsers(
      req.query.q,
      req.user?.id || null
    );
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const base64  = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
    const data    = await usersService.updateProfile(
      req.user.id,
      { avatar_url: dataUrl }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data,
    });
  } catch (err) { next(err); }
};

module.exports = {
  getUserProfile,
  getUserPosts,
  updateProfile,
  searchUsers,
  uploadAvatar,
};