#!/usr/bin/env node

'use strict';

var argv = require('minimist')(process.argv.slice(2));

var installer = require('../lib/installer');
var conf = argv.c || argv.conf;

installer({ conf: conf });

