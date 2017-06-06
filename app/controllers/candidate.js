const service = require('../services/test');

exports.convert = function (req,res){
	var candidateId = req.params.candidateId;
	service.convert(candidateId);
	res.sendStatus(200);
}
