const TestResponse = require('./testResponse');
const CandidateResponse = require('./candidateResponse');

function ResultResponse(data) {
  if(data.test){
    this.test = new TestResponse(data.test);
  }
  if(data.candidateWinner){
    this.candidateWinner = new CandidateResponse(data.candidateWinner);
  }
}

module.exports = ResultResponse;
