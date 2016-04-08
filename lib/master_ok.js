// Used by remotes to determine if this monitor is ok.

var net = require('net');

module.exports.start = function(opts) {
  var server = net.createServer((socket) => {
    socket.end('ok\n');
  }).on('error', (err) => {
    console.log('%s socket error %s', (new Date()).toISOString(), err);
  });

  server.listen(opts.port, opts.host, () => {
    address = server.address();
    console.log('%s master health on %j', (new Date()).toISOString(), address);
  });
}