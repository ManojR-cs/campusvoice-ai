const { categorizeComplaint, summarizeComplaint, detectDuplicates } = require('../services/aiService');

const autoCategorize = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    const result = await categorizeComplaint(title, description);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const summarize = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const summary = await summarizeComplaint(title, description);
    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

const checkDuplicates = async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;
    const result = await detectDuplicates(title, description, category, location);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  autoCategorize,
  summarize,
  checkDuplicates,
};
