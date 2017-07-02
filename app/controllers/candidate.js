const service = require('../services/candidate');

const CandidateRequest = require('../dto/candidateRequest');
const CandidateResponse = require('../dto/candidateResponse');

const TestResponse = require('../dto/testResponse');

exports.convert = function (req,res){
	var candidateId = req.params.candidateId;
	service.convert(candidateId);
	res.sendStatus(200);
}

exports.update = function (req,res){
	var testId = req.params.testId;
	var candidateId = req.params.candidateId;
	var candidateRequestDTO = new CandidateRequest(req.body);
	candidateRequestDTO.id = candidateId;
	service.update(
		testId,
		candidateId,
		candidateRequestDTO,
		function(testModel){
			if(testModel){
				res.json(new TestResponse(testModel));
			}else{
				res.sendStatus(404);
			}
		}
	);
}

exports.convert = function (req,res){
	var candidateId = req.params.candidateId;
	service.convert(candidateId);
	res.sendStatus(200);
}
