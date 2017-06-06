const controller = require('../controllers/candidate');

module.exports = function(router) {
  router.route('/:candidateId/convert')
  .post(function(req, res, next) {
    controller.convert(req,res);
  });
};
