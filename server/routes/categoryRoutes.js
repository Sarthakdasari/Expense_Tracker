const express = require('express');
const { body, param } = require('express-validator');
const {
  getCategories,
  createCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCategories)
  .post(
    [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ max: 40 })
        .withMessage('Category name cannot exceed 40 characters'),
    ],
    validate,
    createCategory
  );

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid category ID format')],
  validate,
  deleteCategory
);

module.exports = router;
