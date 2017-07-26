function TransactionResponse(data) {
	if(data){
		this.id = data._id;
		this.ref = data.ref;
		this.converted = data.converted
	}
}

module.exports = TransactionResponse;
