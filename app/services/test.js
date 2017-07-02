
const TestModel = require('../model/test');
const CandidateModel = require('../model/candidate');
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
				samplePercent: testRequestDTO.samplePercent
			},
		},
		{ new: true },
		function(error,testModelUpdated){
			if(error)handleError(error);
			callback(testModelUpdated);
		}
	);
}

exports.delete = function (testId){
	TestModel.find({_id:testId}).remove().exec();
}

exports.execute = function (testId,callback){
	TestModel.findOne({_id:testId}, function(err, testModel) {
		var candidateSelected=null;
		if(testModel){
			try{
				var testSelectedRequests = 0;
				var candidateRequestsMinor = null;
				var testRequests = testModel.requests;
				var now = new Date();
				var startDate = testModel.startDate;
				var endDate = testModel.endDate;
				if(testModel.active && (startDate===null || now >= new Date(testModel.startDate)) && (endDate===null || now <= new Date(testModel.endDate))){
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
					testModel.update(
						{$inc:{requests:1}},
						function(error, rawResponse) {
							if(error){
								Logger.error(error);
							}
						}
					);
					if(candidateSelected){
						TestModel.update(
							{
								"candidates._id":candidateSelected.id
							},
							{
								$inc:{"candidates.$.requests": 1}
							},
							function(error, rawResponse) {
								if(error){
									Logger.error(error);
								}
							}
						);
					}
				}
			}finally{
				callback(candidateSelected);
			}
		}else{
			callback(candidateSelected);
		}
	});
}
