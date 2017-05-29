function Candidate(data) {
  var shortid = require('shortid');
  if(data){
    if(data.id){
      this.id = data.id;
    }else {
      this.id  = shortid.generate();
    }
    if(data.name){
  	 this.name = data.name;
    }
    if(data.loadBalancePercent){
  	 this.loadBalancePercent = data.loadBalancePercent;
    }
    if(data.requests){
      this.requests = data.requests;
    }
    if(data.converted){
      this.converted = data.converted;
    }
    if(data.payLoad){
      this.payLoad = data.payLoad;
    }
    if(data.convertionRate){
      this.convertionRate = data.convertionRate;
    }
  }
}

module.exports = Candidate;
