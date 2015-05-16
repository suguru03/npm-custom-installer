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

  installPackages(masterPath, config, {}, function(err) {
    console.log(err);
  });

  function installPackages(currentPath, currentConfig, installedPackages, callback) {
    if (_.isEmpty(currentConfig)) {
      return callback();
    }
    var packages = resolvePackages(currentPath, currentConfig, installedPackages);

    install(currentPath, packages.before, packages.after, function(err, log) {
      if (err) {
        throw err;
      }
      console.log(log);
      addInstalledPackages(packages.after);
      async.eachSeries(currentConfig.dependencies, function(conf, key, done) {
        if (!_.isObject(conf)) {
          return done();
        }
        var nextPath = path.resolve(currentPath, dirpath, key);
        installPackages(nextPath, conf, _.clone(installedPackages), done);
      }, callback);
    });

    function addInstalledPackages(afterPackage) {
      _.forEach(afterPackage.dependencies, function(version, key) {
        installedPackages[key] = installedPackages[key] || {};
        installedPackages[key][version] = true;
      });
    }
  }

  function resolvePackages(currentPath, currentConfig, installedPackages) {
    var currentPackagePath = path.resolve(currentPath, filename);
    var beforePackage = require(currentPackagePath);
    var afterPackage = _.mapValues(beforePackage, function(items, key) {
      var replaceConfig = currentConfig[key];
      if (_.isEmpty(replaceConfig)) {
        return items;
      }
      if (_.isString(replaceConfig)) {
        return replaceConfig;
      }
      items = _.mapValues(items, function(item, key) {
        var conf = globalConfig[key] || replaceConfig[key];
        return !conf ? item : _.isString(conf) ? conf : conf.version;
      });
      return items;
    });
    afterPackage.dependencies = _.omit(afterPackage.dependencies, function(version, key) {
      var installed = installedPackages[key];
      return installed && installed[version];
    });
    return {
      before: beforePackage,
      after: afterPackage
    };
  }
};

function install(dirpath, before, after, callback) {
  var packagePath = path.resolve(dirpath, filename);
  fs.writeFileSync(packagePath, JSON.stringify(after), encode);
  exec('cd ' + dirpath + ' && npm install --production', function(err, res) {
    var json = jsbeautifier(JSON.stringify(before), options.beautify);
    fs.writeFileSync(packagePath, json, encode);
    callback(err, res);
  });
}
