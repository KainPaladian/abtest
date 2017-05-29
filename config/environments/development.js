const nconf = require('nconf');

nconf.set('DATABASE_CONFIG', {
  URL: 'https://abteststaging.firebaseio.com',
  SERVICE_ACCOUNT: 'ABTestStaging-915a3c7a4571.json'
});

nconf.set('NODE_PORT',3000);
