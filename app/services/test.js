const firebase = require('firebase');
const db = firebase.database();
const TestModel = require('../model/test');
const ResultModel = require('../model/result');

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
	  callback(new TestModel(snapshot.val()));
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
	this.findById(newTestKey,function(testModel){
		callback(testModel);
	});
}

exports.update = function (testRequestDTO,callback){
	var id = testRequestDTO.id;
	var ref = db.ref("tests/"+id);
	var testModel = null;
	if(ref){
		testModel = new TestModel(testRequestDTO);
		var updates = {};
	  updates['/tests/' + id] = testModel;
		db.ref().update(updates);
	}
	callback(testModel);
}

exports.delete = function (testId){
	var ref = db.ref("tests/"+testId);
	if(ref){
		var updates = {};
	  updates['/tests/' + testId] = null;
		db.ref().update(updates);
	}
}

exports.execute = function (testId,callback){
	var result=null;
	var testRef = db.ref("tests/"+testId);
	if(testRef){
		testRef.once("value", function(snapshotTest) {
			try {
				var testSelectedRequests = 0;
				var candidateSelected = null;
				var candidateRequestsMinor = null;
				var testModel = new TestModel(snapshotTest.val());
				var now = new Date();
				if(testModel.active && now >= new Date(testModel.startDate) && now <= new Date(testModel.endDate)){
					Object.keys(testModel.candidates).forEach(function(key,index) {
						var candidateModel = testModel.candidates[key];
						var candidateRequests = candidateModel.requests;
						testSelectedRequests += candidateRequests;
						if(candidateRequestsMinor===null || candidateRequests<candidateRequestsMinor){
							candidateSelected = candidateModel;
							candidateRequestsMinor = candidateModel.requests;
						}
					});
					var percentSelectedRequests = (testSelectedRequests/testModel.requests);
					var candidateRef = null;
					if(percentSelectedRequests<testModel.samplePercent){
						result = candidateSelected;
						candidateRef = db.ref("tests/"+testModel.id+"/candidates/"+candidateSelected.id);
					}
					testRef.transaction(function(snapshotTest){
						if(snapshotTest && snapshotTest.requests!=null){
							snapshotTest.requests++;
						}
						return snapshotTest;
					});
					if(candidateRef){
						candidateRef.transaction(function(snapshotCandidate){
							if(snapshotCandidate && snapshotCandidate.requests!=null){
								snapshotCandidate.requests++;
								if(snapshotCandidate.converted==null){
									snapshotCandidate.converted = 0;
								}
								snapshotCandidate.convertionRate = snapshotCandidate.converted/snapshotCandidate.requests;
							}
							return snapshotCandidate;
						});
					}
				}
			} catch (e) {
				console.log(e);
			} finally{
				callback(result);
			}
		});
	}else{
		callback(null);
	}
}

exports.convert = function (testId,candidateId){
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
		});
	}
}

exports.result = function (testId,callback){
	var testRef = db.ref("tests/"+testId);
	var resultModel = null;
	if(testRef){
		testRef.once("value",function(snapshotTest){
			var testModel = new TestModel(snapshotTest.val());
			resultModel = new ResultModel(testModel,null);
			callback(resultModel);
		});
	}else{
		callback(resultModel);
	}
}
