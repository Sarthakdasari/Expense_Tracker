const Category = require('../models/Category');
const { PREDEFINED_CATEGORIES } = require('../utils/predefinedCategories');

// @desc    Get all categories (predefined + user's custom)
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const customCategories = await Category.find({ user: req.user._id }).sort({ name: 1 });

    const predefinedList = PREDEFINED_CATEGORIES.map((name) => ({
      _id: `predefined_${name.toLowerCase()}`,
      name,
      isCustom: false,
    }));

    const userList = customCategories.map((c) => ({
      _id: c._id,
      name: c.name,
      isCustom: true,
    }));

    // Merge without duplicates (if user created one with same name)
    const predefinedNames = new Set(PREDEFINED_CATEGORIES.map((c) => c.toLowerCase()));
    const uniqueUserList = userList.filter(
      (c) => !predefinedNames.has(c.name.toLowerCase())
    );

    res.status(200).json({
      success: true,
      data: [...predefinedList, ...uniqueUserList],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const trimmedName = name.trim();

    // Check if it exists in predefined categories
    if (
      PREDEFINED_CATEGORIES.some(
        (c) => c.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `'${trimmedName}' is already a standard predefined category`,
      });
    }

    // Check if user already created this category (case-insensitive regex)
    const existing = await Category.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Custom category '${trimmedName}' already exists`,
      });
    }

    const category = await Category.create({
      name: trimmedName,
      user: req.user._id,
      isCustom: true,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Custom category not found or unauthorized',
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};
