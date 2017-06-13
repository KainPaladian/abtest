var chai = require('chai');
var chaiHttp = require('chai-http');
var index = require('../index');
var logger = require('winston');

chai.use(chaiHttp);

describe('Test', function() {
  it('should list ALL Tests on /test GET', function(done) {
    chai.request("http://localhost:3000/api/1")
      .get('/test')
      .end(function(err, res){
        logger.info(index);
        chai.expect(res).to.have.status(200);
        done();
      });
  });
  it('should list a SINGLE blob on /blob/<id> GET');
  it('should add a SINGLE blob on /blobs POST');
  it('should update a SINGLE blob on /blob/<id> PUT');
  it('should delete a SINGLE blob on /blob/<id> DELETE');
});
