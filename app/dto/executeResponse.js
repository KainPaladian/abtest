const CandidateResponse = require('./candidateResponse');

function ExecuteResponse(testId, candidateModel) {
  if(testId){
    this.testId = testId;
  }
  if(candidateModel){
    this.candidate = new CandidateResponse(candidateModel);
  }
}

module.exports = ExecuteResponse;
