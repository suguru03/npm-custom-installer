'use strict';

module.exports = {
  global: {
    lodash: '3.8.0'
  },
  dependencies: {
    'neo-async': '^1.0.0',
    'func-comparator': {
      version: '0.6.0',
      dependencies: {
        'neo-async': '^1.0.0'
      }
    },
    mocha: {
      version: '2.2.5',
      dependencies: {
        commander: '=2.8.1',
        'glob': '^5.0.0'
      }
    }
  }
};
