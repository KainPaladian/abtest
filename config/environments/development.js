const nconf = require('nconf');

nconf.set('DATABASE_CONFIG', {
  URL: 'https://abteststaging.firebaseio.com',
  SERVICE_ACCOUNT: 'ABTestStaging-915a3c7a4571.json',
  LOGGING_ENABLE: true,
  PERSISTENCE_ENABLED : true
});

nconf.set('NODE_PORT',3000);
