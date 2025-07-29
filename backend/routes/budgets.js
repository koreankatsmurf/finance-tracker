const express = require('express');
const { body } = require('express-validator');
const { 
  getBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget 
} = require('../controllers/budgetController');
const { verifyToken } = require('../utils/auth');

const router = express.Router();

// Budget validation
const budgetValidation = [
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Year must be valid')
];

const budgetUpdateValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number')
];

router.use(verifyToken); // All routes require authentication

router.get('/', getBudgets);
router.post('/', budgetValidation, createBudget);
router.put('/:id', budgetUpdateValidation, updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;