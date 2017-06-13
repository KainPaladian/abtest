var mongoose = require('mongoose');
var config = require('nconf');
var logger = require('winston');
start = function(cb){
	var DATABASE_CONFIG = config.get('DATABASE_CONFIG');
	mongoose.connect(DATABASE_CONFIG.MONGO_URI,DATABASE_CONFIG.MONGO_DB_OPTIONS);
	var db = mongoose.connection;
	db.on('error', function(){
		logger.error('connection error');
	});
	db.once('open', function() {
	  logger.info('connection open');
	});
	if(cb){
		cb();
	}
}


module.exports = start;
