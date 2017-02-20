var express = require('express');
var ParseServer = require('parse-server').ParseServer;

// Configure the Parse API
var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/events',
  appId: 'f8dd0d83bdc78b82378bb69e725d2f28',
  masterKey: 'e66042836eccb6f6f7ca0b1da270ebca',
  serverURL: 'http://localhost:8999/parse'
});

var app = express();
// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);
// Listen for connections on port 8999 
var port = 8999;
app.listen(port, function() {
  console.log('parse-server-example running on port ' + port + '.');
});
