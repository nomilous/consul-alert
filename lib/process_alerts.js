var debug = require('debug')('alerter:process');
var Promise = require('bluebird');

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    debug('posting alerts');

    var states = context.states;
    var consul = context.consul;

    Promise.resolve(states).map(
      function(state) {

        // var key = state.Node + '/' + state.

        console.log(state);

        // consul.kv.get()


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
