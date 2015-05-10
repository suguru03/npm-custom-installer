'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var _ = require('lodash');
var jsbeautifier = require('js-beautify').js_beautify;

var encode = {
  encoding: 'utf8'
};
var options = {
  beautify: {
    indent_size: 2
  }
};

module.exports = function(opts) {
  var conf = opts.conf;
  var currentPath = process.env.PWD;
  var config = require(path.resolve(currentPath, conf));

  var masterPackagePath = path.resolve(currentPath, 'package.json');
  var beforePackage = require(masterPackagePath);
  var afterPackage = _.mapValues(beforePackage, function(items, key) {
    var replaceItems = config[key];
    if (_.isEmpty(replaceItems)) {
      return items;
    }
    items = _.mapValues(replaceItems, function(item) {
      return _.isString(item) ? item : item.version;
    });
    return items;
  });

  fs.writeFileSync(masterPackagePath, JSON.stringify(afterPackage), encode);
  exec('npm install', function(err, res) {
    console.log(err, res);
    var json = jsbeautifier(JSON.stringify(beforePackage), options.beautify);
    fs.writeFileSync(masterPackagePath, json, encode);
  });
};

