'use strict';

var path = require('path');
var program = require('commander');

var installer = require('./lib/installer');

program
  .command('install')
  .option('-c, --conf <path>', 'config path')
  .action(installer);

program.parse(process.argv);
