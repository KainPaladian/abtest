var Logger = require('winston');

const CandidateModel = require('../model/candidate');
const TestModel = require('../model/test');

const InvalidParametersException = require('../exceptions/invalidParametersException');

exports.update = function (testId, candidateId, candidateRequestDTO, callback) {
	TestModel.findOneAndUpdate(
		{ "_id": testId, "candidates._id": candidateId },
		{
			"$set":
			{
				"candidates.$.name": candidateRequestDTO.name,
				"candidates.$.payLoad": candidateRequestDTO.payLoad
			},
		},
		{ new: true },
		function (error, testModelUpdated) {
			callback(testModelUpdated);
		}
	);
}

exports.convertTestWithTransactionsRequired = function (candidateId, callback) {
	TestModel.findOne({ "candidates._id": candidateId },
		function (error, test) {
			if (error) {
				callback(error);
			} else {
				if (test.transactionRequired) {
					callback(new InvalidParametersException("This test required a transactionRef, so you can't call convert API by candidate. See API ~/test/{testeId}/convert/{transactionRef}. "));
				} else {
					convert(candidateId, callback);
				}
			}
		});
}
exports.convertCandidate = function (candidateId, callback) {
	convert(candidateId, callback);
}

function convert(candidateId, callback) {
	TestModel.update(
		{
			"candidates._id": candidateId
		},
		{
			$inc: { "candidates.$.converted": 1 }
		},
		function (error, candidate) {
			if (error) {
				Logger.error(error);
			}
			callback(error, candidate);
		}
	);
}


