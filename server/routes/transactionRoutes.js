const express = require('express');
const { body, param } = require('express-validator');
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

// Apply auth protection to all transaction routes
router.use(protect);

const createValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage("Type must be either 'income' or 'expense'"),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('note')
    .optional()
    .isString()
    .isLength({ max: 250 })
    .withMessage('Note cannot exceed 250 characters'),
];

const updateValidation = [
  param('id').isMongoId().withMessage('Invalid transaction ID format'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage("Type must be either 'income' or 'expense'"),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('note')
    .optional()
    .isString()
    .isLength({ max: 250 })
    .withMessage('Note cannot exceed 250 characters'),
];

const idParamValidation = [
  param('id').isMongoId().withMessage('Invalid transaction ID format'),
];

router
  .route('/')
  .get(getTransactions)
  .post(createValidation, validate, createTransaction);

router
  .route('/:id')
  .get(idParamValidation, validate, getTransactionById)
  .put(updateValidation, validate, updateTransaction)
  .delete(idParamValidation, validate, deleteTransaction);

module.exports = router;
