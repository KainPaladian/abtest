const CandidateRequest = require('./candidateRequest');

function TestRequest(data) {
  if(data){
    this.owner = data.owner;
  	this.name = data.name;
  	this.startDate = data.startDate;
  	this.endDate = data.endDate
  	this.samplePercent = data.samplePercent;
    this.active = data.active;
    if(data.candidates){
      var candidates = [];
      data.candidates.forEach(function(candidateData, index) {
        candidates.push(new CandidateRequest(candidateData));
      });
      this.candidates = candidates;
    }
  }
}

module.exports = TestRequest;
