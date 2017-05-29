const Candidate = require('./candidate');

function Test(data) {
  if(data){
    var model = this;
    if(data.id)
      model.id = data.id;
    if(data.active!=null){
      model.active = data.active;
    }
    if(data.owner)
      model.owner = data.owner;
    if(data.name)
      model.name = data.name;
    if(data.startDate)
      model.startDate = data.startDate;
    if(data.endDate)
      model.endDate = data.endDate
    if(data.samplePercent)
      model.samplePercent = data.samplePercent;
    if(data.requests){
      model.requests = data.requests;
    }
    if(data.candidates){
      model.candidates = {};
      if(data.candidates instanceof Array){
        data.candidates.forEach(function(data, index) {
          var candidateModel = new Candidate(data)
          model.candidates[candidateModel.id] = candidateModel;
        });
      }else if(data.candidates instanceof Object){
        Object.keys(data.candidates).forEach(function(key,index) {
          var candidateModel = new Candidate(data.candidates[key])
          model.candidates[candidateModel.id] = candidateModel;
        });
      }
    }
  }
}

module.exports = Test;
