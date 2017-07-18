const CandidateResponse = require('./candidateResponse');
const TransactionResponse = require('./transactionResponse');

function TestResponse(data) {
  if(data){
    var dto = this;
    dto.id = data.id;
    dto.owner = data.owner;
  	dto.name = data.name;
  	dto.startDate = data.startDate;
  	dto.endDate = data.endDate
  	dto.samplePercent = data.samplePercent;
    dto.requests = data.requests;
    dto.active = data.active;
    dto.transactionRequired = data.transactionRequired;
    if(data.candidates){
      var candidates = [];
      data.candidates.forEach(function(candidateData, index) {
        candidates.push(new CandidateResponse(candidateData));
      });
      dto.candidates = candidates;
    }
    if(data.transactions){
      var transactions = [];
      data.transactions.forEach(function(transactionData, index) {
        transactions.push(new TransactionResponse(transactionData));
      });
      dto.transactions = transactions;
    }
  }
}

module.exports = TestResponse;
