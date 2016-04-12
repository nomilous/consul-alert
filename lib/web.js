var express = require('express')
var app = express();

module.exports.start = function(opts) {
  app.get('/', function(req, res) {
    res.send('ok');
  });

  app.listen(opts.port, opts.host);
}