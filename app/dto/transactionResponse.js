function TransactionResponse(data) {
	if(data){
		this.ref = data._id;
		this.converted = data.converted
	}
}

module.exports = TransactionResponse;
