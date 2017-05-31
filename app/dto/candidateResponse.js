function CandidateResponse(data) {
	if(data){
		this.id = data.id;
		this.name = data.name;
	  this.payLoad = data.payLoad;
		this.convertionRate = data.convertionRate;
		this.converted = data.converted;
		this.requests = data.requests;		
	}
}

module.exports = CandidateResponse;
