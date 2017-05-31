const controller = require('../controllers/test');

module.exports = function(router) {

  router.route('/')
  .get(function(req, res, next) {
    controller.findAll(req,res);
  }).post(function(req, res, next) {
    controller.insert(req,res);
  });

  router.route('/:testId')
  .get(function(req, res, next) {
    controller.findById(req,res);
  })
  .put(function(req, res, next) {
    controller.update(req,res);
  })
  .delete(function(req, res, next) {
    controller.delete(req,res);
  });

  router.route('/:testId/execute')
  .post(function(req, res, next) {
    controller.execute(req,res);
  });

  router.route('/:testId/candidate/:candidateId/convert')
  .post(function(req, res, next) {
    controller.convert(req,res);
  });

};
