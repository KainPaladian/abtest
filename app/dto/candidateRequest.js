function CandidateRequest(data) {
	if(data){
		this.name = data.name;
	  this.payLoad = data.payLoad;
	}
}

module.exports = CandidateRequest;
