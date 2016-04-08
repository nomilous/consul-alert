var os = require('os');

module.exports = function() {
  // assemble array of local ipv4 interfaces
  var addresses = [];
  var ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(function(key) {
    if (key.match(/^lo/)) return;
    var iface = ifaces[key];
    iface.forEach(function(addr) {
      if (addr.family !== 'IPv4') return;
      addresses.push(addr.address);
    });
  });
  return addresses;
}
