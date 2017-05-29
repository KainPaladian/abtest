// ----------------- REQUIRE --------------------
const fs = require("fs");
// ----------------- REQUIRE --------------------

// ----------------- CONFIG --------------------
const express = require("express");
const bodyParser = require('body-parser');
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

//router
var routerV1 = require('./routes/routes_v1');

//api
var apiPath = '/api';
app.use(apiPath, routerV1);
// ----------------- CONFIG --------------------

// ----------------- FILTERS--------------------
// log all requests
app.use((req,res,next)=>{
  var now = new Date();
  var todayFormat = now.getFullYear() + "_" + (now.getMonth() + 1) + "_" + now.getDate();;
  var log = `${now.toString()}: ${req.method} ${req.url}`;
  fs.appendFile('./logs/access_'+todayFormat+'.log',log  + '\n');
  next();
})

//TODO: authenticator
app.use((req,res,next)=>{
  next();
})
// ----------------- FILTERS--------------------

// ----------------- FIREBASE ------------------
const firebase = require("firebase-admin");

var serviceAccount = require("./config/firebase/abtest-7a0da-firebase-adminsdk-g4mmu-be39f08f74.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://abtest-7a0da.firebaseio.com"
});
// ----------------- FIREBASE ------------------

// ----------------- START --------------------
var port = process.env.PORT || 3000;
app.listen(port);
console.log("abtest is running on port: " + port);
// ----------------- START --------------------
