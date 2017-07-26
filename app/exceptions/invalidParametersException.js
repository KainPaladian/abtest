function InvalidParametersException(message) {
	if(message){
		this.message = message;
	}
}

module.exports = InvalidParametersException;
