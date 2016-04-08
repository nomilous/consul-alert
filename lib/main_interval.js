var Promise = require('bluebird');
var dns = require('dns');
var resolve4 = Promise.promisify(dns.resolve4);
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
    var monitors = [];

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
          monitors.push(state);
        }
      });

      return Promise.resolve(monitors).map(
        function(monitor) {

          console.log('resolve', monitor.Node)

          return new Promise(function(resolve, reject) {

            resolve4(monitor.Node)
            .then(function(res) {
              monitor.IP = res;
              resolve();
            })
            .catch(reject) // TODO: rejecting directly means monitor won't fire alert
                          //        if dns is failing ...FIX!
          })
        }, {concurrency: 5}
      )
    })

    .then(function() {

      console.log('resolved monitors', monitors);

      // console.log({
      //   leader: leader,
      //   peers: peers,
      //   localAddrs: localAddrs,
      // });
    })

    .then(resolve)

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
