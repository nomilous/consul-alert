var debug = require('debug')('alerter:process');
var Promise = require('bluebird');

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    debug('posting alerts');

    var consul = context.consul;
    var nodes;

    consul.catalog.node.list()

    .then(function(res) {
      nodes = res;
      console.log(nodes);
    })

    .then(resolve)
    .catch(reject);
  });
}
