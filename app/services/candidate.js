
const CandidateModel = require('../model/candidate');
const TestModel = require('../model/test');
var Logger = require('winston');

exports.update = function (testId,candidateId,candidateRequestDTO,callback){
	TestModel.findOneAndUpdate(
		{"_id":testId,"candidates._id":candidateId},
		{
			"$set":
			{
				"candidates.$.name": candidateRequestDTO.name,
				"candidates.$.payLoad": candidateRequestDTO.payLoad
			},
		},
		{ new: true },
		function(error,testModelUpdated){
			callback(testModelUpdated);
		}
	);
}

exports.convert = function (candidateId){
	TestModel.update(
		{
			"candidates._id":candidateId
		},
		{
			$inc:{"candidates.$.converted": 1}
		},
		function(error, rawResponse) {
			if(error){
				Logger.error(error);
			}
		}
	);
}
