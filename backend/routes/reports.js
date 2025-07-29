const express = require('express');
const { Transaction, sequelize } = require('../models');
const { verifyToken } = require('../utils/auth');
const { Op } = require('sequelize');

const router = express.Router();

router.use(verifyToken);

// Dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get total balance
    const totalIncome = await Transaction.sum('amount', {
      where: { userId: req.user.id, type: 'income' }
    }) || 0;

    const totalExpenses = await Transaction.sum('amount', {
      where: { userId: req.user.id, type: 'expense' }
    }) || 0;

    const netBalance = totalIncome - totalExpenses;

    // Get current month data
    const monthlyIncome = await Transaction.sum('amount', {
      where: {
        userId: req.user.id,
        type: 'income',
        date: {
          [Op.between]: [
            `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
            `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`
          ]
        }
      }
    }) || 0;

    const monthlyExpenses = await Transaction.sum('amount', {
      where: {
        userId: req.user.id,
        type: 'expense',
        date: {
          [Op.between]: [
            `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
            `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`
          ]
        }
      }
    }) || 0;

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      netBalance,
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Monthly spending by category
router.get('/spending-by-category', async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const categorySpending = await Transaction.findAll({
      where: {
        userId: req.user.id,
        type: 'expense',
        date: {
          [Op.between]: [
            `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`,
            `${targetYear}-${targetMonth.toString().padStart(2, '0')}-31`
          ]
        }
      },
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']]
    });

    res.json({ categorySpending });
  } catch (error) {
    console.error('Category spending error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Monthly trends (last 6 months)
router.get('/monthly-trends', async (req, res) => {
  try {
    const trends = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const income = await Transaction.sum('amount', {
        where: {
          userId: req.user.id,
          type: 'income',
          date: {
            [Op.between]: [
              `${year}-${month.toString().padStart(2, '0')}-01`,
              `${year}-${month.toString().padStart(2, '0')}-31`
            ]
          }
        }
      }) || 0;

      const expenses = await Transaction.sum('amount', {
        where: {
          userId: req.user.id,
          type: 'expense',
          date: {
            [Op.between]: [
              `${year}-${month.toString().padStart(2, '0')}-01`,
              `${year}-${month.toString().padStart(2, '0')}-31`
            ]
          }
        }
      }) || 0;

      trends.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        net: income - expenses
      });
    }

    res.json({ trends });
  } catch (error) {
    console.error('Monthly trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calendar data
router.get('/calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [
            `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`,
            `${targetYear}-${targetMonth.toString().padStart(2, '0')}-31`
          ]
        }
      },
      attributes: [
        'date',
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['date', 'type']
    });

    // Organize by date
    const calendarData = {};
    transactions.forEach(transaction => {
      const date = transaction.date;
      if (!calendarData[date]) {
        calendarData[date] = { income: 0, expenses: 0 };
      }
      calendarData[date][transaction.type === 'income' ? 'income' : 'expenses'] = parseFloat(transaction.dataValues.total);
    });

    res.json({ calendarData });
  } catch (error) {
    console.error('Calendar data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;