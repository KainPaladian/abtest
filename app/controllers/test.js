const service = require('../services/test');

const TestRequest = require('../dto/testRequest');
const TestResponse = require('../dto/testResponse');

const ExecuteRequest = require('../dto/executeRequest');
const ExecuteResponse = require('../dto/executeResponse');

const InvalidParametersException = require('../exceptions/invalidParametersException');

exports.findAll = function (req, res) {
	service.findAll(function (testModels) {
		var testsResponse = [];
		if (testModels) {
			testModels.forEach(function (testModel, index) {
				testsResponse.push(new TestResponse(testModel));
			});
		}
		var data = {};
		data.tests = testsResponse;
		return res.json(data);
	});
}

exports.findById = function (req, res) {
	service.findById(req.params.testId, function (testModel) {
		return res.json(new TestResponse(testModel));
	});
}

exports.insert = function (req, res) {
	var testRequestDTO = new TestRequest(req.body);
	service.insert(testRequestDTO, function (testModel) {
		return res.json(new TestResponse(testModel));
	});
}

exports.update = function (req, res) {
	var testId = req.params.testId;
	var testRequestDTO = new TestRequest(req.body);
	testRequestDTO.id = testId;
	service.update(testRequestDTO, function (testModel) {
		if (testModel) {
			return res.json(new TestResponse(testModel));
		} else {
			return res.sendStatus(404);
		}
	});
}

exports.delete = function (req, res) {
	service.delete(req.params.testId);
	return res.sendStatus(200);
}

exports.execute = function (req, res) {
	var testId = req.params.testId;
	var transactionRef = req.query.transactionRef;
	service.execute(testId, transactionRef, function (testModel, candidateModel, transactionRef, error) {
		if (error) {
			if (error instanceof InvalidParametersException) {
				return res.status(412).send(error.message);
			} else {
				return res.status(500).send(error);
			}
		}
		if (testModel) {
			if (candidateModel) {
				return res.json(new ExecuteResponse(testModel.id, candidateModel, transactionRef));
			} else {
				return res.sendStatus(200);
			}
		} else {
			return res.sendStatus(404);
		}
	});
}

exports.reset = function (req, res) {
	var testId = req.params.testId;
	service.reset(testId, function (testModel) {
		if (testModel) {
			return res.json(new TestResponse(testModel));
		} else {
			return res.sendStatus(404);
		}
	});
}

exports.convert = function (req, res) {
	var testId = req.params.testId;
	var transactionRef = req.params.transactionRef;
	if (testId == undefined) {
		return res.status(412).send("TestId is required.");
	}
	if (transactionRef == undefined) {
		return res.status(412).send("TransactionRef is required");
	}
	service.convert(testId, transactionRef, function (error) {
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
