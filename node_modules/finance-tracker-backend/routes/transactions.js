const express = require('express');
const { body } = require('express-validator');
const { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  getCategories 
} = require('../controllers/transactionController');
const { verifyToken } = require('../utils/auth');

const router = express.Router();

// Transaction validation
const transactionValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('date').isISO8601().withMessage('Date must be valid')
];

router.use(verifyToken); // All routes require authentication

router.get('/', getTransactions);
router.post('/', transactionValidation, createTransaction);
router.put('/:id', transactionValidation, updateTransaction);
router.delete('/:id', deleteTransaction);
router.get('/categories', getCategories);

module.exports = router;