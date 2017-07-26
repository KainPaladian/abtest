var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Transaction = require('./transaction');

var testTransactionsSchema = new Schema({
  testId: { type: String },
  transactions: [Transaction.schema]
});

var TestTransactions = mongoose.model('TestTransactions', testTransactionsSchema);

module.exports = TestTransactions;
