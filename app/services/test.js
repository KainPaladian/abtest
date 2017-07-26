
const TestModel = require('../model/test');
const TransactionModel = require('../model/transaction');
const TestTransactionsModel = require('../model/testTransactions');
const CandidateModel = require('../model/candidate');

const InvalidParametersException = require('../exceptions/invalidParametersException');

var Logger = require('winston');

exports.findAll = function (callback){
	TestModel.find({}, function(err, tests) {
	  callback(tests);
	});
}

exports.findById = function (testId,callback){
	TestModel.findOne({_id:testId}, function(err, testModel) {
		if(testModel && testModel!=undefined){
			if(testModel.transactionRequired){
				TestTransactionsModel.findOne({testId:testId}, function(err, testTransactionsModel) {
					testModel.transactions = testTransactionsModel.transactions;
					callback(testModel);
				});
			}else{
				callback(testModel);
			}
		}else {
			callback(testModel);
		}
	});
}

exports.insert = function (testRequestDTO,callback){
	var testModel = new TestModel(testRequestDTO);
	testModel.save(function(error){
		 if (error) return handleError(error);
		 callback(testModel);
	});
}

exports.update = function (testRequestDTO,callback){
	TestModel.findByIdAndUpdate(
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
		function(error,testModelUpdated){
			if(error)handleError(error);
			callback(testModelUpdated);
		}
	);
}

exports.reset = function (testId,callback){
	findById = this.findById;
	TestModel.findById(testId,function(error,testModel){
		if(testModel){
			testModel.requests = 0;
			testModel.candidates.forEach(function(candidateModel){
				candidateModel.converted = 0;
				candidateModel.requests = 0;
				candidateModel.convertionRate = 0;
			});
			testModel.save(function(error,testModel){
				if(testModel.transactionRequired){
					TestTransactionsModel.findOneAndUpdate(
						{ testId : testId },
						{ $set : { transactions : [] } },
						function(err,numberAffected,raw){
							if (error) return Logger.error(error);
							findById(testModel.id,callback);
						}
					);
				}else{
					findById(testModel.id,callback);
				}
			});
		}else{
			callback(null);
		}
	});
}

exports.delete = function (testId){
	TestModel.find({_id:testId}).remove().exec();
}

exports.execute = function (testId,transactionRef,callback){
	TestModel.findById(testId,function(err,testModel) {
		if(testModel){
			if(testModel.transactionRequired){
				if(transactionRef==undefined){
					callback(null,null,new InvalidParametersException("TransactionRef as query param is required."));
				}else{
					TestTransactionsModel.findOne(
						{'testId':testId,'transactions.ref': transactionRef},
						function(error,testTransactionsModel){
							if(testTransactionsModel && testTransactionsModel!=undefined){
								callback(null,null,new InvalidParametersException("TransactionRef has been used."));
							}else{
								_execute(testModel,transactionRef,callback);
							}
						});
				}
			}else{
				_execute(testModel,transactionRef,callback);
			}
		}else{
			callback();
		}
	});
}

function _execute(testModel,transactionRef,callback){
	var candidateSelected=null;
	try {
		var testSelectedRequests = 0;
		var candidateRequestsMinor = null;
		var testRequests = testModel.requests;
		var now = new Date();
		var startDate = testModel.startDate;
		var endDate = testModel.endDate;
		if(testModel.active && (!startDate || now >= new Date(testModel.startDate)) && (!endDate || now <= new Date(testModel.endDate))){
			testModel.candidates.forEach(function(candidateModel) {
				var candidateRequests = candidateModel.requests;
				testSelectedRequests += candidateRequests;
				if(candidateRequestsMinor===null || candidateRequests<candidateRequestsMinor){
					candidateSelected = candidateModel;
					candidateRequestsMinor = candidateRequests;
				}
			});
			var percentSelectedRequests = (testSelectedRequests/testRequests);
			percentSelectedRequests = isNaN(percentSelectedRequests)?0:percentSelectedRequests;
			var candidateRef = null;
			if(percentSelectedRequests>testModel.samplePercent){
				candidateSelected =  null;
			}
			incrementTest(transactionRef,testModel,candidateSelected);
		}
	}finally{
		callback(testModel,candidateSelected);
	}
}

function incrementTest(transactionRef,test,candidate) {
	test.update(
		{ $inc : { requests: 1 } },
		function(error, rawResponse) {
			if (error) return Logger.error(error);
		}
	);
	if(candidate){
		TestModel.update(
			{ "candidates._id": candidate.id },
			{ $inc: { "candidates.$.requests": 1 } },
			function(error, rawResponse) {
				if (error) return Logger.error(error);
			}
		);
		if(test.transactionRequired && transactionRef){
			var transaction = new TransactionModel( { ref: transactionRef,converted: 0 } );
			TestTransactionsModel.findOneAndUpdate(
				{ testId: test.id },
				{ $addToSet: { transactions: transaction } },
				{ upsert: true },
				function(error,numberAffected,raw){
					if (error) return Logger.error(error);
				}
			);
		}
	}
}
