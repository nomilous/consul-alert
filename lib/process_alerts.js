var debug = require('debug')('alerter:process');
var Promise = require('bluebird');

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    debug('posting alerts');

    var states = context.states;
    var consul = context.consul;
    var notifyDown = [];
    var notifyUp = [];

    Promise.resolve(states).map(
      function(state) {

        /*
         * { Node: 'hostname',
         * CheckID: 'loadAvg',
         * Name: 'Load Average',
         * Status: 'passing',
         * Notes: 'Critical 20, warning 16',
         * Output: '',
         * ServiceID: '',
         * ServiceName: '',
         * CreateIndex: 1206,
         * ModifyIndex: 1283 }
         */

        var previous;
        var key = state.Node + '/' + state.ServiceID + '.' + state.CheckID;

        return consul.kv.get({key: key})

        .then(function(res) {
          if (typeof res !== 'undefined') {
            previous = JSON.parse(res.Value);
            // console.log('PPPP', previous);
          }
        })

        .then(function() {
          if (typeof previous === 'undefined') {
            if (state.Status !== 'passing') {
              return notifyDown.push(state);
            }
            return;
          }
          if (state.Status !== 'passing') {
            if (previous.status === 'passing') {
              return notifyDown.push(state);
            }
            return;
          }
          if (previous.status !== 'passing') {
            return notifyUp.push(state);
          }
        })




        .then(function() {
          if (typeof previous === 'undefined') {
            return consul.kv.set({
              key: key,
              value: JSON.stringify({
                detected: (new Date()).toISOString(),
                status: state.Status,
                // count: 1
              })
            })
          }

          return consul.kv.set({
            key: key,
            value: JSON.stringify({
              detected: previous.detected,
              status: state.Status,
              // count: previous.status === state.Status ? state.Status === 'passing' ? 1 : ++previous.count : 1
            })
          })
        })





      }, {concurrency: 5}
    )

    .then(function() {
      notifyDown.forEach(function(state) {
        console.log('%s DOWN %s.%s.%s', (new Date()).toISOString(), state.CheckID, state.ServiceID, state.Node);
      });

      notifyUp.forEach(function(state) {
        console.log('%s UP %s.%s.%s', (new Date()).toISOString(), state.CheckID, state.ServiceID, state.Node);
      });
    })


    .then(resolve)

    .catch(reject);


    // var sortByNode = {};

    // states.forEach(function(state) {
    //   if (state.Status === 'passing') return;

    //   sortByNode[state.Node] = sortByNode[state.Node] || {};
    //   sortByNode[state.Node][state.Name] = sortByNode[state.Node][state.Name] || state;
    // });

    // console.log(sortByNode);

    // resolve();
  });
}
