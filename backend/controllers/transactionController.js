const { Transaction, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    
    if (type && ['income', 'expense'].includes(type)) {
      whereClause.type = type;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = startDate;
      if (endDate) whereClause.date[Op.lte] = endDate;
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, type, category, description, date, isRecurring, receiptUrl } = req.body;

    const transaction = await Transaction.create({
      userId: req.user.id,
      amount,
      type,
      category,
      description,
      date,
      isRecurring: isRecurring || false,
      receiptUrl
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount, type, category, description, date, isRecurring, receiptUrl } = req.body;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.update({
      amount,
      type,
      category,
      description,
      date,
      isRecurring: isRecurring || false,
      receiptUrl
    });

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.destroy();

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Transaction.findAll({
      where: { userId: req.user.id },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      raw: true
    });

    const categoryList = categories.map(c => c.category);
    
    // Add default categories if user has no transactions yet
    const defaultCategories = [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
      'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
      'Salary', 'Freelance', 'Investments', 'Other'
    ];

    const uniqueCategories = [...new Set([...categoryList, ...defaultCategories])];

    res.json({ categories: uniqueCategories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
};