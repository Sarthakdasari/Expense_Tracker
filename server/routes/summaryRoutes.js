const express = require('express');
const { query } = require('express-validator');
const {
  getMonthlySummary,
  getYearlySummary,
} = require('../controllers/summaryController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.get(
  '/monthly',
  [
    query('month')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Month must be an integer between 1 and 12'),
    query('year')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Year must be a valid 4-digit year'),
  ],
  validate,
  getMonthlySummary
);

router.get(
  '/yearly',
  [
    query('year')
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage('Year must be a valid 4-digit year'),
  ],
  validate,
  getYearlySummary
);

module.exports = router;
