
const TestModel = require('../model/test');
const CandidateModel = require('../model/candidate');

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
	var id = testRequestDTO.id;
	var ref = db.ref("tests/"+id);
	this.findById(id,function(testModel){
		if(testModel){
			testModel = new TestModel(testRequestDTO);
			var updates = {};
			updates['/tests/' + id] = testModel;
			db.ref().update(updates);
		}
		callback(testModel);
	});
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
				if(testModel.active && now >= new Date(testModel.startDate) && now <= new Date(testModel.endDate)){
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
						candidateSelected = null;
					}
					// testRef.transaction(function(snapshotTest){
					// 	if(snapshotTest){
					// 		if(snapshotTest.requests!=undefined){
					// 			snapshotTest.requests++;
					// 		}else{
					// 			snapshotTest.requests = 1;
					// 		}
					// 	}
					// 	return snapshotTest;
					// });
					if(candidateSelected){
						// candidateRef.transaction(function(snapshotCandidate){
						// 	if(snapshotCandidate){
						// 		if(snapshotCandidate.requests!=undefined){
						// 			snapshotCandidate.requests++;
						// 		}else{
						// 			snapshotCandidate.requests = 1;
						// 		}
						// 		if(snapshotCandidate.converted===undefined){
						// 			snapshotCandidate.converted = 0;
						// 		}
						// 		snapshotCandidate.convertionRate = snapshotCandidate.converted/snapshotCandidate.requests;
						// 	}
						// 	return snapshotCandidate;
						// });
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

exports.convert = function (testId,candidateId,callback){
	var candidateRef = db.ref("tests/"+testId+"/candidates/"+candidateId);
	if(candidateRef){
		candidateRef.transaction(function(snapshotCandidate){
			if(snapshotCandidate){
				if(snapshotCandidate.converted==null){
					snapshotCandidate.converted = 0;
				}
				if(snapshotCandidate.converted + 1 <= snapshotCandidate.requests){
					snapshotCandidate.converted++;
					snapshotCandidate.convertionRate = snapshotCandidate.converted/snapshotCandidate.requests;
				}
			}
			return snapshotCandidate;
		},
		function(error, committed, snapshotCandidate) {
			if (error) {
				console.log('Transaction failed abnormally!', error);
			} else if (!committed) {
				console.log('We aborted the transaction (because ada already exists).');
			}
		});
	}else{
		callback(null);
	}
}
