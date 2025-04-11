const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Add transaction
router.post('/add', async (req, res) => {
  try {
    const newTx = await Transaction.create(req.body);
    res.json(newTx);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Get all transactions of a user
router.get('/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});



module.exports = router;