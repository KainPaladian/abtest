
const Test = require('../model/test');
const TransactionModel = require('../model/transaction');
const TestTransactionsModel = require('../model/testTransactions');

const candidateService = require('../services/candidate');

const InvalidParametersException = require('../exceptions/invalidParametersException');

var Logger = require('winston');

exports.findAll = function (callback) {
	Test.find({}, function (err, tests) {
		callback(tests);
	});
}

exports.findById = function (testId, callback) {
	Test.findOne({ _id: testId }, function (err, test) {
		if (test && test != undefined) {
			TestTransactionsModel.findOne({ testId: testId }, function (err, testTransactionsModel) {
				if (testTransactionsModel && testTransactionsModel != undefined) {
					test.transactions = testTransactionsModel.transactions;
				}
				callback(test);
			});
		} else {
			callback(test);
		}
	});
}

exports.insert = function (testRequestDTO, callback) {
	var test = new Test(testRequestDTO);
	test.save(function (error) {
		if (error) return handleError(error);
		callback(test);
	});
}

exports.update = function (testRequestDTO, callback) {
	Test.findByIdAndUpdate(
		testRequestDTO.id,
		{
			$set:
			{
				owner: testRequestDTO.owner,
				name: testRequestDTO.name,
				startDate: testRequestDTO.startDate,
				endDate: testRequestDTO.endDate,
				samplePercent: testRequestDTO.samplePercent,
				transactionRequired: testRequestDTO.transactionRequired
			},
		},
		{ new: true },
		function (error, testUpdated) {
			if (error) handleError(error);
			callback(testUpdated);
		}
	);
}

exports.reset = function (testId, callback) {
	findById = this.findById;
	Test.findById(testId, function (error, test) {
		if (test) {
			test.requests = 0;
			test.candidates.forEach(function (newCandidate) {
				newCandidate.converted = 0;
				newCandidate.requests = 0;
				newCandidate.convertionRate = 0;
			});
			test.save(function (error, test) {
				TestTransactionsModel.findOneAndUpdate(
					{ testId: testId },
					{ $set: { transactions: [] } },
					function (err, numberAffected, raw) {
						if (error) return Logger.error(error);
						findById(test.id, callback);
					}
				);
			});
		} else {
			callback(null);
		}
	});
}

exports.delete = function (testId) {
	Test.find({ _id: testId }).remove().exec();
}

exports.execute = function (testId, transactionRef, callback) {
	Test.findById(testId, function (err, test) {
		if (test) {
			if (test.transactionRequired) {
				if (transactionRef == undefined) {
					callback(test,
						null,
						transactionRef,
						new InvalidParametersException("TransactionRef as query param is required."));
				} else {
					TestTransactionsModel.findOne(
						{ 'testId': testId, 'transactions.ref': transactionRef },
						function (error, testTransactionsModel) {
							if (testTransactionsModel && testTransactionsModel != undefined) {
								callback(
									test,
									null,
									transactionRef,
									new InvalidParametersException("TransactionRef has been used."));
							} else {
								processExecute(test, transactionRef, callback);
							}
						});
				}
			} else {
				processExecute(test, transactionRef, callback);
			}
		} else {
			callback();
		}
	});
}

function processExecute(test, transactionRef, callback) {
	var selectedCandidate = null;
	try {
		selectedCandidate = selectCandidate(test);
		incrementTest(test, selectedCandidate, transactionRef);
	} finally {
		callback(test, selectedCandidate, transactionRef, null);
	}
}

function selectCandidate(test) {
	var selectedCandidate = null;
	var sumTestedRequests = 0;
	if (test.active
		&& (!test.startDate || new Date() >= new Date(test.startDate))
		&& (!test.endDate || now <= new Date(test.endDate))) {
		test.candidates.forEach(function (newCandidate) {
			sumTestedRequests += newCandidate.requests;
			if (selectedCandidate === null || newCandidate.requests < selectedCandidate.requests) {
				selectedCandidate = newCandidate;
			}
		});
		var percentSelectedRequests = (sumTestedRequests / test.requests);
		percentSelectedRequests = isNaN(percentSelectedRequests) ? 0 : percentSelectedRequests;
		var candidateRef = null;
		if (percentSelectedRequests > test.samplePercent) {
			selectedCandidate = null;
		}
	}
	return selectedCandidate;
}

function incrementTest(test, candidate, transactionRef) {
	var resumeCandidate = null;
	test.update(
		{ $inc: { requests: 1 } },
		function (error, rawResponse) {
			if (error) return Logger.error(error);
		}
	);
	if (candidate) {
		resumeCandidate = {
			id: candidate.id,
			name: candidate.name,
			payLoad: candidate.payLoad
		};
		Test.update(
			{ "candidates._id": candidate.id },
			{ $inc: { "candidates.$.requests": 1 } },
			function (error, rawResponse) {
				if (error) return Logger.error(error);
			}
		);
	}
	var transaction = test.transactionRequired ? new TransactionModel({
		ref: transactionRef,
		candidate: resumeCandidate,
		executeDate: new Date(),
		converted: false
	}) : new TransactionModel({
		candidate: resumeCandidate,
		executeDate: new Date()
	});

	TestTransactionsModel.findOneAndUpdate(
		{ testId: test.id },
		{ $addToSet: { transactions: transaction } },
		{ upsert: true },
		function (error, numberAffected, raw) {
			if (error) return Logger.error(error);
		}
	);
}

exports.convert = function (testId, transactionRef, callback) {
	TestTransactionsModel.findOne(
		{ testId: testId, 'transactions.ref': transactionRef })
		.select({ transactions: { $elemMatch: { ref: transactionRef } } })
		.exec(
		function (e1, testTransactionsModel) {
			if (e1) {
				callback(e1);
			} else {
				if (testTransactionsModel === null
					|| testTransactionsModel.transactions === null
					|| testTransactionsModel.transactions.lenght == 0) {
					callback(new InvalidParametersException("TransactionRef was not found."));
				} else {
					var transaction = testTransactionsModel.transactions[0];
					if (transaction.candidate === null) {
						callback(new InvalidParametersException("Transaction cannot be converted because it has not candidate."));
					} else if(transaction.converted){
						callback(new InvalidParametersException("Transaction has been converted."));
					} else {
						candidateService.convertCandidate(transaction.candidate.id, function (e2, candidate) {
							if (e2) {
								callback(e2);
							}
							TestTransactionsModel.findOneAndUpdate(
								{
									testId: testId, 'transactions.ref': transactionRef
								},
								{
									$set:
									{ 'transactions.$.converted': true, 'transactions.$.convertDate': new Date() }
								}, function (e3, transaction) {
									if (e3) {
										callback(e3);
									}
									callback(e3, transaction);
								}
							);
						});
					}
				}
			}
		});
}
