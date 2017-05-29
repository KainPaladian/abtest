function CandidateResponse(data) {
	if(data){
		this.id = data.id;
		this.name = data.name;
	  this.payLoad = data.payLoad;
	}
}

module.exports = CandidateResponse;
