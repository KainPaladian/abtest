const service = require('../services/candidate');

const CandidateRequest = require('../dto/candidateRequest');
const CandidateResponse = require('../dto/candidateResponse');

const TestResponse = require('../dto/testResponse');

const InvalidParametersException = require('../exceptions/invalidParametersException');

exports.update = function (req, res) {
	var testId = req.params.testId;
	var candidateId = req.params.candidateId;
	var candidateRequestDTO = new CandidateRequest(req.body);
	candidateRequestDTO.id = candidateId;
	service.update(
		testId,
		candidateId,
		candidateRequestDTO,
		function (testModel) {
			if (testModel) {
				return res.json(new TestResponse(testModel));
			} else {
				return res.sendStatus(404);
			}
		}
	);
}

exports.convert = function (req, res) {
	var candidateId = req.params.candidateId;
	service.convertTestWithTransactionsRequired(candidateId, function (error) {
		if (error) {
			if (error instanceof InvalidParametersException) {
				return res.status(412).send(error.message);
			} else {
				return res.status(500).send(error);
			}
		} else {
			return res.sendStatus(200);
		}
	});
}
