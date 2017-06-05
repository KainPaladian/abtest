const nconf = require('nconf');

nconf.set('DATABASE_CONFIG', {
  MONGO_URI: 'mongodb://gustavo.santos:gfstgf1950@ds163681.mlab.com:63681/abtest',
});

nconf.set('NODE_PORT',3000);
