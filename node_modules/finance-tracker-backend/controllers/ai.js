const multer = require('multer');
const { receiptScanner } = require('../services/ai/receiptScanner');
const { transactionClassifier } = require('../services/ai/transactionClassifier');
const { Transaction } = require('../models');
const { Op } = require('sequelize');

const upload = multer({ storage: multer.memoryStorage() });

// AI Receipt Scanner
const scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt image provided' });
    }

    const receiptData = await receiptScanner.processReceipt(req.file.buffer);
    
    res.json({
      receiptData,
      message: 'Receipt processed successfully'
    });
  } catch (error) {
    console.error('Receipt scan error:', error);
    res.status(500).json({ error: 'Failed to scan receipt' });
  }
};

// AI Auto-Categorization
const categorizeTransaction = async (req, res) => {
  try {
    const { description, amount, merchant } = req.body;

    if (!description && !merchant) {
      return res.status(400).json({ error: 'Description or merchant required' });
    }

    const suggestedCategory = await transactionClassifier.categorizeTransaction({
      description,
      amount,
      merchant
    });

    res.json({ suggestedCategory });
  } catch (error) {
    console.error('Auto-categorization error:', error);
    res.status(500).json({ error: 'Failed to categorize transaction' });
  }
};

// AI Predictive Budgeting
const predictBudget = async (req, res) => {
  try {
    const { category } = req.query;

    // Get last 6 months of spending data for the category
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        type: 'expense',
        category: category || { [Op.ne]: null },
        date: { [Op.gte]: sixMonthsAgo.toISOString().split('T')[0] }
      },
      order: [['date', 'ASC']]
    });

    if (transactions.length < 3) {
      return res.json({
        prediction: null,
        message: 'Not enough historical data for prediction'
      });
    }

    const prediction = await transactionClassifier.predictBudget(transactions, category);

    res.json({ prediction });
  } catch (error) {
    console.error('Budget prediction error:', error);
    res.status(500).json({ error: 'Failed to generate budget prediction' });
  }
};

// Bulk categorize transactions
const bulkCategorize = async (req, res) => {
  try {
    const uncategorizedTransactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        autoCategorizationApplied: false
      },
      limit: 50
    });

    const categorizedTransactions = [];

    for (const transaction of uncategorizedTransactions) {
      try {
        const suggestedCategory = await transactionClassifier.categorizeTransaction({
          description: transaction.description,
          amount: transaction.amount,
          merchant: transaction.category // Using category as merchant fallback
        });

        await transaction.update({
          category: suggestedCategory,
          autoCategorizationApplied: true
        });

        categorizedTransactions.push({
          id: transaction.id,
          originalCategory: transaction.category,
          suggestedCategory
        });
      } catch (error) {
        console.error(`Failed to categorize transaction ${transaction.id}:`, error);
      }
    }

    res.json({
      message: `Successfully categorized ${categorizedTransactions.length} transactions`,
      categorizedTransactions
    });
  } catch (error) {
    console.error('Bulk categorization error:', error);
    res.status(500).json({ error: 'Failed to bulk categorize transactions' });
  }
};

module.exports = {
  scanReceipt,
  categorizeTransaction,
  predictBudget,
  bulkCategorize,
  upload
};