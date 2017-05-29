function Result(test,candidateWinner) {
  if(test){
    this.test = test;
  }
  if(candidateWinner){
    this.candidateWinner = candidateWinner;
  }
}

module.exports = Result;
