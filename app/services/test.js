
const TestModel = require('../model/test');
const TransactionModel = require('../model/transaction');
const CandidateModel = require('../model/candidate');
const InvalidParameters = require('../exceptions/invalidParameters');
var Logger = require('winston');

exports.findAll = function (callback){
	TestModel.find({}, function(err, tests) {
	  callback(tests);
	});
}

exports.findById = function (testId,callback){
	TestModel.findOne({_id:testId}, function(err, tests) {
		callback(tests);
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
	this.findById(testId,function(testModel){
		testModel.requests = 0;
		testModel.candidates.forEach(function(candidateModel) {
			candidateModel.converted = 0;
			candidateModel.requests = 0;
		});
		testModel.save(function(error){
			callback(testModel);
		});
	});
}

exports.delete = function (testId){
	TestModel.find({_id:testId}).remove().exec();
}

exports.execute = function (testId,transactionRef,callback){
	TestModel.findById(
		testId,
		function(err, testModel) {
		var candidateSelected=null;
		if(testModel){
			if(testModel.transactionRequired && transactionRef== undefined){
				throw new InvalidParameters("transactionRef is required.");
			}
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
		}else{
			callback(null,null);
		}
	});
}

function sleep(ms) {
    var unixtime_ms = new Date().getTime();
    while(new Date().getTime() < unixtime_ms + ms) {}
}

function incrementTest(transactionRef,test,candidate) {
	test.update(
		{ $inc : { requests: 1 } },
		function(error, rawResponse) {
			if(error){
				Logger.error(error);
			}
		}
	);
	if(candidate){
		TestModel.update(
			{ "candidates._id": candidate.id },
			{ $inc: { "candidates.$.requests": 1 } },
			function(error, rawResponse) {
				if(error){
					Logger.error(error);
				}
			}
		);
		if(transactionRef){
			var transaction = new TransactionModel( { _id: transactionRef,converted: 0 } );
			test.update(
				{ $addToSet: { transactions:transaction } },
				function(error, rawResponse) {
					if(error){
						Logger.error(error);
					}
				}
			);
		}
	}
}
