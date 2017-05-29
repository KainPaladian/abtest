var changeCase = require('change-case');
var express = require('express');
var routes = require('require-dir')();

module.exports = function(app) {

  // Initialize all routes
  Object.keys(routes).forEach(function(routeName) {
    var router = express.Router();
    // You can add some middleware here
    // router.use(someMiddleware);

    // Initialize the route to add its functionality to router
    require('./' + routeName)(router);

    // Add router to the speficied route name in the app
    app.use('/api/1/' + changeCase.paramCase(routeName), router);
  });
};
