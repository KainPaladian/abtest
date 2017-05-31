const CandidateResponse = require('./candidateResponse');

function ExecuteResponse(testId, candidateModel) {
  if(testId){
    this.test = {};
    this.test.id = testId;
    if(candidateModel){
      this.test.candidate = {};
      this.test.candidate.id = candidateModel.id;
      this.test.candidate.payLoad = candidateModel.payLoad;
    }
  }
}

module.exports = ExecuteResponse;
