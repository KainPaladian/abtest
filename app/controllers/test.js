const service = require('../services/test');

const TestRequest = require('../dto/testRequest');
const TestResponse = require('../dto/testResponse');

const ExecuteRequest = require('../dto/executeRequest');
const ExecuteResponse = require('../dto/executeResponse');

const ResultResponse = require('../dto/resultResponse');

exports.findAll = function (req,res){
	service.findAll(function(testModels) {
		var testsResponse = [];
		if(testModels){
			testModels.forEach(function(testModel,index){
				testsResponse.push(new TestResponse(testModel));
			});
		}
		var data={};
		data.tests = testsResponse;
	  res.json(data);
	});
}

exports.findById = function (req,res){
	service.findById(req.params.testId,function(testModel){
		res.json(new TestResponse(testModel));
	});
}

exports.insert = function (req,res){
	var testRequestDTO = new TestRequest(req.body);
	service.insert(testRequestDTO,function(testModel){
		res.json(new TestResponse(testModel));
	});
}

exports.update = function (req,res){
	var testId = req.params.testId;
	var testRequestDTO = new TestRequest(req.body);
	testRequestDTO.id = testId;
	service.update(testRequestDTO,function(testModel){
		res.json(new TestResponse(testModel));
	});
}

exports.delete = function (req,res){
	service.delete(req.params.testId);
	res.sendStatus(200);
}

exports.execute = function (req,res){
	var testId = req.params.testId;
	service.execute(testId,function(candidateModel){
		res.json(new ExecuteResponse(testId,candidateModel));
	});
}

exports.convert = function (req,res){
	var testId = req.params.testId;
	var candidateId = req.params.candidateId;
	service.convert(testId,candidateId);
	res.sendStatus(200);
}

exports.result = function (req,res){
	var testId = req.params.testId;
	service.result(testId,function(resultModel){
		res.json(new ResultResponse(resultModel));
	});
}
