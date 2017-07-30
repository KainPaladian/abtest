var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Candidate = require('./candidate');

var transactionSchema = new Schema({
  ref: { type: String },
  executeDate: { type: Date, default: null },
  candidate: { type: Object, default: null },
  converted: { type: Boolean},
  convertDate: { type: Date }
});

var Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
