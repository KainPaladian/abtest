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
      if(data.candidates instanceof Object){
        Object.keys(data.candidates).forEach(function(key,index) {
          var candidateResponse = new CandidateResponse(data.candidates[key])
          candidates.push(candidateResponse);
        });
      }
      dto.candidates = candidates;
    }
  }
}

module.exports = TestResponse;
