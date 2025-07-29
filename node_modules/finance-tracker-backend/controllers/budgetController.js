const { Budget, Transaction, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const budgets = await Budget.findAll({
      where: {
        userId: req.user.id,
        month: targetMonth,
        year: targetYear
      }
    });

    // Get actual spending for each budget category
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.sum('amount', {
          where: {
            userId: req.user.id,
            category: budget.category,
            type: 'expense',
            date: {
              [Op.between]: [
                `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`,
                `${targetYear}-${targetMonth.toString().padStart(2, '0')}-31`
              ]
            }
          }
        });

        return {
          ...budget.toJSON(),
          spent: spent || 0,
          remaining: parseFloat(budget.amount) - (spent || 0),
          percentUsed: spent ? Math.round((spent / parseFloat(budget.amount)) * 100) : 0
        };
      })
    );

    res.json({ budgets: budgetsWithSpending });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, amount, month, year } = req.body;

    // Check if budget already exists for this category/month/year
    const existingBudget = await Budget.findOne({
      where: {
        userId: req.user.id,
        category,
        month,
        year
      }
    });

    if (existingBudget) {
      return res.status(400).json({ error: 'Budget already exists for this category and month' });
    }

    const budget = await Budget.create({
      userId: req.user.id,
      category,
      amount,
      month,
      year
    });

    res.status(201).json({
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount } = req.body;

    const budget = await Budget.findOne({
      where: { id, userId: req.user.id }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await budget.update({ amount });

    res.json({
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOne({
      where: { id, userId: req.user.id }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await budget.destroy();

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};