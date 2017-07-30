const CandidateResponse = require('./candidateResponse');

function TransactionResponse(data) {
	if (data) {
		this.id = data._id;
		this.ref = data.ref;
		this.executeDate = data.executeDate;
		this.candidate = data.candidate === null ? null : new CandidateResponse(data.candidate);
		this.converted = data.converted
		this.convertDate = data.convertDate;
	}
}

module.exports = TransactionResponse;
