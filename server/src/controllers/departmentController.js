const Department = require('../models/Department');
const User = require('../models/User');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('headId', 'name email phone');
    res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, code, headId } = req.body;
    const existing = await Department.findOne({ code: code.toUpperCase() });
    if (existing) {
      res.status(400);
      throw new Error('Department code already exists');
    }

    const dept = await Department.create({
      name,
      code: code.toUpperCase(),
      headId: headId || null,
    });

    res.status(201).json({
      success: true,
      department: dept,
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const getStaffMembers = async (req, res, next) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('name email department phone');
    res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  getStaffMembers,
};
