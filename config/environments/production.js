const nconf = require('nconf');

nconf.set('DATABASE_CONFIG', {
    MONGO_URI: 'mongodb://ds161262.mlab.com:61262/abtest',
    MONGO_DB_OPTIONS: {
        server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
        replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
        user: 'abtest',
        pass: 'abtest'
    }
});