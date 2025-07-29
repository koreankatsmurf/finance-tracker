const express = require('express');
const { verifyToken, requirePremium } = require('../utils/auth');
const { 
  scanReceipt, 
  categorizeTransaction, 
  predictBudget, 
  bulkCategorize,
  upload 
} = require('../controllers/ai');

router.use(verifyToken);
router.use(requirePremium);

// AI Routes
router.post('/scan-receipt', upload.single('receipt'), scanReceipt);
router.post('/categorize-transaction', categorizeTransaction);
router.get('/predict-budget', predictBudget);
router.post('/bulk-categorize', bulkCategorize);

module.exports = router;