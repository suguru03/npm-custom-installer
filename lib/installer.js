'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var _ = require('lodash');
var async = require('neo-async');
var jsbeautifier = require('js-beautify').js_beautify;

var encode = {
  encoding: 'utf8'
};
var options = {
  beautify: {
    indent_size: 2
  }
};

var filename = 'package.json';
var dirpath = 'node_modules';

module.exports = function(opts) {
  var conf = opts.conf;
  var masterPath = process.env.PWD;
  var config = require(path.resolve(masterPath, conf));
  var globalConfig = config.global || {};

  installPackages(masterPath, config, function(err) {
    console.log(err);
  });

  function installPackages(currentPath, currentConfig, callback) {
    if (_.isEmpty(currentConfig)) {
      return callback();
    }
    var currentPackagePath = path.resolve(currentPath, filename);
    var packages = resolvePackages(currentPackagePath, currentConfig);

    install(currentPackagePath, packages.before, packages.after, function(err, res) {
      if (err) {
        throw err;
      }
      console.log(res);
      async.eachSeries(currentConfig.dependencies, function(conf, key, done) {
        if (!_.isObject(conf)) {
          return done();
        }
        var nextPath = path.resolve(currentPath, dirpath, key);
        installPackages(nextPath, conf, done);
      }, callback);
    });
  }

  function resolvePackages(currentPath, currentConfig) {
    var beforePackage = require(currentPath);
    var afterPackage = _.mapValues(beforePackage, function(items, key) {
      var replaceConfig = globalConfig[key] || currentConfig[key];
      if (_.isEmpty(replaceConfig)) {
        return items;
      }
      if (_.isString(replaceConfig)) {
        return replaceConfig;
      }
      items = _.mapValues(replaceConfig, function(conf) {
        return _.isString(conf) ? conf : conf.version;
      });
      return items;
    });
    return {
      before: beforePackage,
      after: afterPackage
    };
  }
};

function install(path, before, after, callback) {
  fs.writeFileSync(path, JSON.stringify(after), encode);
  exec('npm install --production', function(err, res) {
    var json = jsbeautifier(JSON.stringify(before), options.beautify);
    fs.writeFileSync(path, json, encode);
    callback(err, res);
  });
}
