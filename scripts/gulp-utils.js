var gulp = require('gulp');
var filter = require('gulp-filter');
var through2 = require('through2');
var lazypipe = require('lazypipe');
var gutil = require('gulp-util');
var Buffer = require('buffer').Buffer;

var path = require('path');

var getModuleInfo = require('../config/ngModuleData.js');

exports.humanizeCamelCase = function(str) {
  return str.charAt(0).toUpperCase() +
    str.substring(1).replace(/[A-Z]/g, function($1) {
      return ' ' + $1.toUpperCase();
    });
};

// Gives back a pipe with an array of the parsed data from all of the module's demos
// @param moduleName modulename to parse
// @param fileTasks: tasks to run on the files found in the demo's folder
// Emits demo objects
exports.readModuleDemos = function(moduleName, fileTasks) {
  var name = moduleName.split('.').pop();
  return gulp.src('src/{components,services}/' + name + '/demo*/')
    .pipe(through2.obj(function(demoFolder, enc, next) {
      var demoId = name + path.basename(demoFolder.path);
      var srcPath = demoFolder.path.substring(demoFolder.path.indexOf('src/') + 4);
      var split = srcPath.split('/');

      var demo = { 
        id: demoId,
        css:[], html:[], js:[] 
      };

      gulp.src(demoFolder.path + '**/*', { base: path.dirname(demoFolder.path) })
        .pipe(fileTasks(demoId))
        .pipe(through2.obj(function(file, enc, cb) {
          if (/index.html$/.test(file.path)) {
            var match = file.path.match(/\/demo.*\//);

            demo.moduleName = moduleName,
            demo.name = path.basename(demoFolder.path);
            demo.label = exports.humanizeCamelCase(path.basename(demoFolder.path).replace(/^demo/, ''));
            demo.id = demoId;
            demo.index = toDemoObject(file);

          } else {
            var fileType = path.extname(file.path).substring(1);
            if (fileType == 'js') {
              demo.ngModule = demo.ngModule || getModuleInfo(file.contents.toString());
            }
            demo[fileType] && demo[fileType].push(toDemoObject(file));
          }
          cb();
        }, function(done) {
          next(null, demo);
        }));

      function toDemoObject(file) {
        return {
          contents: file.contents.toString(),
          name: path.basename(file.path),
          label: path.basename(file.path),
          fileType: path.extname(file.path).substring(1),
          outputPath: 'demo-partials/' + name + '/' + path.basename(demoFolder.path) + '/' + path.basename(file.path),
        };
      }
    }));
};

var pathsForModules = {};
exports.filesForModule = function(name) {
  if (pathsForModules[name]) {
    return gulp.src(pathsForModules[name]);
  } else {
    return gulp.src('src/{services,components}/**')
      .pipe(through2.obj(function(file, enc, next) {
        var modName = getModuleInfo(file.contents).module;
        if (modName == name) {
          var modulePath = file.path.split(path.sep).slice(0, -1).join(path.sep);
          pathsForModules[name] = modulePath + '/**';
          var self = this;
          gulp.src(pathsForModules[name])
            .on('data', function(data) {
              self.push(data);
            });
        }
        next();
      }));
  }
};

exports.buildNgMaterialDefinition = function() {
  var buffer = [];
  var modulesSeen = [];
  return through2.obj(function(file, enc, next) {
    var moduleName;
    if (moduleName = getModuleInfo(file.contents).module) {
      modulesSeen.push(moduleName);
    }
    buffer.push(file);
    next();
  }, function(done) {
    var EXPLICIT_DEPS = ['ng', 'ngAnimate', 'ngAria'];
    var angularFileContents = "angular.module('ngMaterial', " + JSON.stringify(EXPLICIT_DEPS.concat(modulesSeen)) + ');';
    var angularFile = new gutil.File({
      base: process.cwd(),
      path: process.cwd() + '/ngMaterial.js',
      contents: new Buffer(angularFileContents)
    });
    this.push(angularFile);
    var self = this;
    buffer.forEach(function(file) {
      self.push(file);
    });
    buffer = [];
    done();
  });
};

exports.buildModuleBower = function(name, version) {
  return through2.obj(function(file, enc, next) {
    this.push(file);

    
    var moduleInfo = getModuleInfo(file.contents);
    if (moduleInfo.module) {
      var bowerDeps = {};

      moduleInfo.dependencies && moduleInfo.dependencies.forEach(function(dep) {
        var convertedName = 'angular-material-' + dep.split('.').pop();
        bowerDeps[convertedName] = version;
      });

      var bowerContents = JSON.stringify({
        name: 'angular-material-' + name,
        version: version,
        dependencies: bowerDeps
      });
      var bowerFile = new gutil.File({
        base: file.base,
        path: file.base + '/bower.json',
        contents: new Buffer(bowerContents)
      });
      this.push(bowerFile);
    }
    next();
  });
};

exports.hoistScssVariables = function() {
  return through2.obj(function(file, enc, next) {
    var contents = file.contents.toString().split('\n');
    var lastVariableLine = -1;

    for( var currentLine = 0; currentLine < contents.length; ++currentLine) {
      var line = contents[currentLine];
      if (/^\s*\$/.test(line)) {
        if (currentLine != lastVariableLine + 1) {
          var variable = contents.splice(currentLine, 1)[0];
          contents.splice(++lastVariableLine, 0, variable);
        }
      }
    }
    file.contents = new Buffer(contents.join('\n'));
    this.push(file);
    next();
  });
};
