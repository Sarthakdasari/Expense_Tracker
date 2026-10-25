const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// @desc    Get monthly summary (totals, balance, category breakdown)
// @route   GET /api/summary/monthly?month=10&year=2026
// @access  Private
const getMonthlySummary = async (req, res, next) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12',
      });
    }

    // Start of month (inclusive) and start of next month (exclusive)
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

    const pipeline = [
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalIncome: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
                  },
                },
                totalExpense: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
                  },
                },
                transactionCount: { $sum: 1 },
              },
            },
          ],
          expenseCategories: [
            {
              $match: { type: 'expense' },
            },
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
          ],
          incomeCategories: [
            {
              $match: { type: 'income' },
            },
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
          ],
        },
      },
    ];

    const [result] = await Transaction.aggregate(pipeline);

    const overview = result?.overview[0] || {
      totalIncome: 0,
      totalExpense: 0,
      transactionCount: 0,
    };

    const totalIncome = Math.round(overview.totalIncome * 100) / 100;
    const totalExpense = Math.round(overview.totalExpense * 100) / 100;
    const balance = Math.round((totalIncome - totalExpense) * 100) / 100;

    // Add percentages to expense categories
    const expenseBreakdown = (result?.expenseCategories || []).map((item) => ({
      category: item._id,
      total: Math.round(item.total * 100) / 100,
      count: item.count,
      percentage:
        totalExpense > 0
          ? Math.round((item.total / totalExpense) * 1000) / 10
          : 0,
    }));

    const incomeBreakdown = (result?.incomeCategories || []).map((item) => ({
      category: item._id,
      total: Math.round(item.total * 100) / 100,
      count: item.count,
      percentage:
        totalIncome > 0
          ? Math.round((item.total / totalIncome) * 1000) / 10
          : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        year,
        month,
        monthName: MONTH_NAMES[month - 1],
        totalIncome,
        totalExpense,
        balance,
        transactionCount: overview.transactionCount,
        expenseBreakdown,
        incomeBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get yearly summary (month-by-month income vs expense)
// @route   GET /api/summary/yearly?year=2026
// @access  Private
const getYearlySummary = async (req, res, next) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0));

    const pipeline = [
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const monthlyAggregations = await Transaction.aggregate(pipeline);

    // Map into complete 12-month series
    const monthlyMap = new Map();
    monthlyAggregations.forEach((item) => {
      monthlyMap.set(item._id, {
        income: Math.round(item.income * 100) / 100,
        expense: Math.round(item.expense * 100) / 100,
        count: item.count,
      });
    });

    let yearlyTotalIncome = 0;
    let yearlyTotalExpense = 0;

    const monthsData = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const monthStat = monthlyMap.get(monthNum) || {
        income: 0,
        expense: 0,
        count: 0,
      };

      yearlyTotalIncome += monthStat.income;
      yearlyTotalExpense += monthStat.expense;

      return {
        month: monthNum,
        monthName: MONTH_NAMES[i],
        income: monthStat.income,
        expense: monthStat.expense,
        net: Math.round((monthStat.income - monthStat.expense) * 100) / 100,
        count: monthStat.count,
      };
    });

    yearlyTotalIncome = Math.round(yearlyTotalIncome * 100) / 100;
    yearlyTotalExpense = Math.round(yearlyTotalExpense * 100) / 100;

    res.status(200).json({
      success: true,
      data: {
        year,
        yearlyTotalIncome,
        yearlyTotalExpense,
        yearlyNetSavings:
          Math.round((yearlyTotalIncome - yearlyTotalExpense) * 100) / 100,
        months: monthsData,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlySummary,
  getYearlySummary,
};
