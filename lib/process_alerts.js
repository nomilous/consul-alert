var debug = require('debug')('alerter:process');
var Promise = require('bluebird');

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    debug('posting alerts');

    var states = context.states;
    var sortByNode = {};

    states.forEach(function(state) {

      console.log(state);

      sortByNode[state.Node] = sortByNode[state.Node] || {};
      sortByNode[state.Node][state.Name] = sortByNode[state.Node][state.Name] || {};

    });

    console.log(sortByNode);

    resolve();
  });
}
