var Promise = require('bluebird');
var consul = require('consul')({promisify: true});
var debug = require('debug')('monitor');
var getIfaces = require('./get_ifaces');
var run;

module.exports.start = function(opts) {
  var running = false;
  setInterval(function() {
    if (running) return;
    running = true;
    run().then(
      function() {
        running = false;
      },
      function(err) {
        console.log('%s run error %s', (new Date()).toISOString(), err.stack);
        running = false;
      }
    )
  }, opts.interval);
}

run = function() {
  return new Promise(function(resolve, reject) {
    debug('run');

    var peers;
    var leader;
    var localAddrs;
    var isLeader = false;
    var states;
    var monitors = {};

    consul.status.peers()

    .then(function(res) {
      peers = res;
      return consul.status.leader()
    })

    .then(function(res) {
      leader = res;
      return getIfaces();
    })

    .then(function(res) {
      localAddrs = res;
      var leaderIp = leader.split(':')[0];
      isLeader = localAddrs.indexOf(leaderIp) >= 0;
      debug('runing as leader ?', isLeader);
      return consul.health.state('any');
    })

    .then(function(res) {
      states = res;

      states.forEach(function(state) {
        if (state.CheckID === 'monit') {
          monitors[state.Node] = state;
        }
      });

      console.log(states);

    })

    .then(function() {
      console.log({
        leader: leader,
        peers: peers,
        localAddrs: localAddrs,
      });
    })

    .then(resolve);

    .catch(function(err) {
      console.log('%s run error %s', (new Date()).toISOString(), err.stack);
      resolve();
    })

  });
}



// var consul = require('consul')();

// setInterval(function() {

//   consul.health.state('any', function(err, result) {
//     if (err) {
//       return console.error(err);
//     }
//     console.log(result);
//   });

// }, 1000);
