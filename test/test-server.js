var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var index = require('../index');
var logger = require('winston');
var config = require('nconf');

const NODE_PORT = config.get('NODE_PORT');

const URL_SERVER = "http://localhost:"+NODE_PORT+"/api";

chai.use(chaiHttp);

var testModel = {
  owner: "HOT_PAY",
  name: "TEST"+new Date(),
  startDate: new Date(),
  samplePercent: 1,
  candidates:[
    {
      name: "C_TEST"+new Date(),
      payLoad: {
          p: 1
      }
    }
  ]
}

var candidateModel = {};

describe('Test', function() {
  it('should create one Tests on /test POST', function(done) {
    chai.request(URL_SERVER)
      .post('/1/test')
      .send(
        testModel
      )
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('owner',testModel.owner);
        res.body.should.have.property('name',testModel.name);
        res.body.should.have.property('samplePercent',testModel.samplePercent);
        res.body.should.have.property('candidates').with.lengthOf(1);
        testModel.id = res.body.id;
        done();
      });
  });
  it('should execute one Tests on /test/:testId/execute POST', function(done) {
    chai.request(URL_SERVER)
      .post('/1/test/'+testModel.id+'/execute')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('test')
        res.body.should.have.property('test').and.have.property('id',testModel.id);
        res.body.should.have.property('test').and.have.property('candidate');
        candidateModel = res.body.test.candidate;
        done();
      });
  });
  it('should convert one Tests on /test/:testId/candidate/:candidate/convert POST', function(done) {
    chai.request(URL_SERVER)
      .post('/1/test/'+testModel.id+'/candidate/'+candidateModel.id+'/convert')
      .end(function(err, res){
        res.should.have.status(200);
        done();
      });
  });
  it('should get one Test on /test/:testId GET', function(done) {
    chai.request(URL_SERVER)
      .get('/1/test/'+testModel.id)
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('id',testModel.id);
        res.body.should.have.property('requests',1);
        res.body.should.have.property('candidates').with.lengthOf(1);
        var candidate = res.body.candidates[0];
        chai.expect(candidate.requests).equals(1);
        chai.expect(candidate.convertionRate).equals(1);
        done();
      });
  });
});
