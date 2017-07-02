const testController = require('../controllers/test');
const candidateController = require('../controllers/candidate');

module.exports = function(router) {

  router.route('/')
  .get(function(req, res, next) {
    testController.findAll(req,res);
  }).post(function(req, res, next) {
    testController.insert(req,res);
  });

  router.route('/:testId')
  .get(function(req, res, next) {
    testController.findById(req,res);
  })
  .put(function(req, res, next) {
    testController.update(req,res);
  })
  .delete(function(req, res, next) {
    testController.delete(req,res);
  });

  router.route('/:testId/execute')
  .post(function(req, res, next) {
    testController.execute(req,res);
  });

  router.route('/:testId/reset')
  .put(function(req, res, next) {
    testController.reset(req,res);
  });

  router.route('/:testId/candidate/:candidateId')
  .put(function(req, res, next) {
    candidateController.update(req,res);
  });

  router.route('/:testId/candidate/:candidateId/convert')
  .post(function(req, res, next) {
    candidateController.convert(req,res);
  });

};
