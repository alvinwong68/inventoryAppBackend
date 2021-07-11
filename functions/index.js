const functions = require("firebase-functions");
const config = require('./server/config');
let app = require('express')();

app = config(app);

exports.api = functions.region('asia-east2').https.onRequest(app);