const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      ...data,
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }
    const data = await authService.loginUser(email, password);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      ...data,
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
