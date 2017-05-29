const firebase = require("firebase");
var config = require('nconf');

var DATABASE_CONFIG = config.get('DATABASE_CONFIG');

firebase.initializeApp({
  serviceAccount: DATABASE_CONFIG.SERVICE_ACCOUNT,
  databaseURL: DATABASE_CONFIG.URL
});

module.exports = function(cb) {
  cb();
};
