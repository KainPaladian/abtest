const firebase = require('firebase');
const db = firebase.database();
const TestModel = require('../model/test');
const CandidateModel = require('../model/candidate');

exports.findAll = function (callback){
	var ref = db.ref("tests");
	ref.once("value").then(function(snapshot) {
		var testModels = [];
		if(snapshot){
			snapshot.forEach(function(child,index){
				testModels.push(new TestModel(child.val()));
			});
		}
	  callback(testModels);
	});
}

exports.findById = function (testId,callback){
	var ref = db.ref("tests/"+testId);
	ref.once("value", function(snapshot) {
		var testModel = new TestModel(snapshot.val());
		if(testModel.id){
			callback(testModel);
		}else {
			callback(null);
		}

	});
}

exports.insert = function (testRequestDTO,callback){
	var ref = db.ref("tests");
	var newTestKey = ref.push().key;
	testRequestDTO.id = newTestKey;
	var newTestModel = new TestModel(testRequestDTO);
	var updates = {};
  updates['/tests/' + newTestKey] = newTestModel;
	db.ref().update(updates);
	this.findById(newTestKey,callback);
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

exports.delete = function (testId,callback){
	var ref = db.ref("tests/"+testId);
	this.findById(testId,function(testModel){
		if(testModel){
			var updates = {};
		  updates['/tests/' + testId] = null;
			db.ref().update(updates);
		}
		callback(testModel);
	});
}

exports.execute = function (testId,callback){
	var candidateSelected=null;
	var testModel = null;
	var testRef = db.ref("tests/"+testId);
	if(testRef){
		testRef.once("value", function(snapshotTest) {
			try {
				var testSelectedRequests = 0;
				var candidateRequestsMinor = null;
				testModel = new TestModel(snapshotTest.val());
				var testRequests = testModel.requests!=undefined?testModel.requests:0;
				var now = new Date();
				if(testModel.active && now >= new Date(testModel.startDate) && now <= new Date(testModel.endDate)){
					Object.keys(testModel.candidates).forEach(function(key,index) {
						var candidateModel = testModel.candidates[key];
						var candidateRequests = candidateModel.requests!=undefined?candidateModel.requests:0;
						testSelectedRequests += candidateRequests;
						if(candidateRequestsMinor===null || candidateRequests<candidateRequestsMinor){
							candidateSelected = candidateModel;
							candidateRequestsMinor = candidateRequests;
						}
					});
					var percentSelectedRequests = (testSelectedRequests/testRequests);
					percentSelectedRequests = isNaN(percentSelectedRequests)?0:percentSelectedRequests;
					var candidateRef = null;
					if(percentSelectedRequests<testModel.samplePercent){
						candidateRef = db.ref("tests/"+testModel.id+"/candidates/"+candidateSelected.id);
					}else{
						candidateSelected = null;
					}
					testRef.transaction(function(snapshotTest){
						if(snapshotTest){
							if(snapshotTest.requests!=undefined){
								snapshotTest.requests++;
							}else{
								snapshotTest.requests = 1;
							}
						}
						return snapshotTest;
					});
					if(candidateRef){
						candidateRef.transaction(function(snapshotCandidate){
							if(snapshotCandidate){
								if(snapshotCandidate.requests!=undefined){
									snapshotCandidate.requests++;
								}else{
									snapshotCandidate.requests = 1;
								}
								if(snapshotCandidate.converted===undefined){
									snapshotCandidate.converted = 0;
								}
								snapshotCandidate.convertionRate = snapshotCandidate.converted/snapshotCandidate.requests;
							}
							return snapshotCandidate;
						});
					}
				}
			}finally {
				callback(testModel,candidateSelected);
			}
		});
	}else{
		callback(testModel,candidateSelected);
	}
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
