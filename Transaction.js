const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  userId: String,
  type: String, // income or expense
  amount: Number,
  category: String,
  date: Date,
  description: String
});
module.exports = mongoose.model('Transaction', transactionSchema);