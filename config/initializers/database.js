var mongoose = require('mongoose');
var config = require('nconf');
var logger = require('winston');
start = function(cb){
	var DATABASE_CONFIG = config.get('DATABASE_CONFIG');
	mongoose.connect(DATABASE_CONFIG.MONGO_URI,DATABASE_CONFIG.MONGO_DB_OPTIONS);
	var db = mongoose.connection;
	db.on('error', function(){
		logger.error('[ABTest] connection error');
	});
	db.once('open', function() {
	  logger.info('[ABTest] connection open');
	});
	if(cb){
		cb();
	}
}


module.exports = start;
