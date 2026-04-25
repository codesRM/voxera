const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// ✅ NEW — Check username availability
const checkUsername = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username || username.length < 3) {
      return res.status(200).json({ available: null });
    }
    const result = await authService.checkUsername(username);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

// ✅ NEW — Check email availability
const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(200).json({ available: null });
    }
    const result = await authService.checkEmail(email);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, logout, checkUsername, checkEmail };