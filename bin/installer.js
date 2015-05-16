#!/usr/bin/env node

'use strict';

var program = require('commander');

var installer = require('../lib/installer');

program
  .command('install')
  .option('-c, --conf <path>', 'config path')
  .action(installer);

program.parse(process.argv);
