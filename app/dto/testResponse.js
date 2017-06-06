const CandidateResponse = require('./candidateResponse');

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
    if(data.candidates){
      var candidates = [];
      data.candidates.forEach(function(candidateData, index) {
        candidates.push(new CandidateResponse(candidateData));
      });
      dto.candidates = candidates;
    }
  }
}

module.exports = TestResponse;
