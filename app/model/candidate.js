var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var candidateSchema = new Schema({
  name: { type: String, trim: true },
  converted: { type: Number, default: 0 },
  requests: { type: Number, default: 0 },
  payLoad: { type: Schema.Types.Mixed, default: 0 }
});

candidateSchema.virtual('convertionRate').get(function () {
  return this.requests == 0 ? 0 : this.converted / this.requests;
});

var Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
