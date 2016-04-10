var debug = require('debug')('alerter:process');
var Promise = require('bluebird');

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    debug('posting alerts');

    var states = context.states;
    var consul = context.consul;
    var notifyDown = [];

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
          previous = res;
          if (typeof previous === 'undefined') {
            if (state.status !== 'passing') {
              notifyDown.push(state);
              return consul.kv.set({
                key: key,
                value: {}
              });
            }
          } else {
            console.log('previous', previous);
          }

        })


      }, {concurrency: 5}
    )

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
