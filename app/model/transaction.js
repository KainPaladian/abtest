var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var transactionSchema = new Schema({
  ref:  { type: String},
  converted:  { type: Boolean, default: true }
});

var Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
