// /index.js
'use strict';

var server = require('./config/initializers/server');
var nconf = require('nconf');
var async = require('async');
var logger = require('winston');

// Load Environment variables from .env file
require('dotenv').load();

// Set up configs
nconf.use('memory');
// First load command line arguments
nconf.argv();
// Load environment variables
nconf.env();

const NODE_ENV = nconf.get('NODE_ENV');

// Load config file for the environment
require('./config/environments/' + NODE_ENV);

logger.info('[ABTest] Starting server initialization on '+NODE_ENV+ ' environment');

// Initialize Modules
async.series([
  function initializeDBConnection(callback) {
    require('./config/initializers/database')(callback);
  },
  function startServer(callback) {
    server(callback);
  }], function(err) {
    if (err) {
      logger.error('initialization failed', err);
    } else {
      logger.info('[ABTest] initialized SUCCESSFULLY');
    }
  }
);
