var gulp = require('gulp');
var filter = require('gulp-filter');
var through2 = require('through2');
var lazypipe = require('lazypipe');
var gutil = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');
var Buffer = require('buffer').Buffer;
var fs = require('fs');

var path = require('path');
var findModule = require('../config/ngModuleData.js');

exports.humanizeCamelCase = function(str) {
  switch (str) {
    case 'fabSpeedDial':
      return 'FAB Speed Dial';
    case 'fabToolbar':
      return 'FAB Toolbar';
    default:
      return str.charAt(0).toUpperCase() + str.substring(1).replace(/[A-Z]/g, function($1) {
            return ' ' + $1.toUpperCase();
          });
  }
};

/**
 * Copy all the demo assets to the dist directory
 * NOTE: this excludes the modules demo .js,.css, .html files
 */
exports.copyDemoAssets = function(component, srcDir, distDir) {
  gulp.src(srcDir + component + '/demo*/')
      .pipe(through2.obj( copyAssetsFor ));

  function copyAssetsFor( demo, enc, next){
    var demoID = component + "/" + path.basename(demo.path);
    var demoDir = demo.path + "/**/*";

    var notJS  = '!' + demoDir + '.js';
    var notCSS = '!' + demoDir + '.css';
    var notHTML= '!' + demoDir + '.html';

    gulp.src([demoDir, notJS, notCSS, notHTML])
        .pipe(gulp.dest(distDir + demoID));

    next();
  }
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
        ngModule: '',
        id: demoId,
        css:[], html:[], js:[]
      };

      gulp.src(demoFolder.path + '/**/*', { base: path.dirname(demoFolder.path) })
        .pipe(fileTasks(demoId))
        .pipe(through2.obj(function(file, enc, cb) {
          if (/index.html$/.test(file.path)) {
            demo.moduleName = moduleName;
            demo.name = path.basename(demoFolder.path);
            demo.label = exports.humanizeCamelCase(path.basename(demoFolder.path).replace(/^demo/, ''));
            demo.id = demoId;
            demo.index = toDemoObject(file);

          } else {
            var fileType = path.extname(file.path).substring(1);
            if (fileType == 'js') {
              demo.ngModule = demo.ngModule || findModule.any(file.contents.toString());
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
          outputPath: 'demo-partials/' + name + '/' + path.basename(demoFolder.path) + '/' + path.basename(file.path)
        };
      }
    }));
};

var pathsForModules = {};

exports.pathsForModule = function(name) {
  return pathsForModules[name] || lookupPath();

  function lookupPath() {
    gulp.src('src/{services,components,core}/**/*')
          .pipe(through2.obj(function(file, enc, next) {
            var module = findModule.any(file.contents);
            if (module && module.name == name) {
              var modulePath = file.path.split(path.sep).slice(0, -1).join(path.sep);
              pathsForModules[name] = modulePath + '/**';
            }
            next();
          }));
    return pathsForModules[name];
  }
}

exports.filesForModule = function(name) {
  if (pathsForModules[name]) {
    return srcFiles(pathsForModules[name]);
  } else {
    return gulp.src('src/{services,components,core}/**/*')
      .pipe(through2.obj(function(file, enc, next) {
        var module = findModule.any(file.contents);
        if (module && (module.name == name)) {
          var modulePath = file.path.split(path.sep).slice(0, -1).join(path.sep);
          pathsForModules[name] = modulePath + '/**';
          var self = this;
          srcFiles(pathsForModules[name]).on('data', function(data) {
            self.push(data);
          });
        }
        next();
      }));
  }

  function srcFiles(path) {
    return gulp.src(path)
      .pipe(through2.obj(function(file, enc, next) {
        if (file.stat.isFile()) next(null, file);
        else next();
      }));
  }
};

exports.appendToFile = function(filePath) {
  var bufferedContents;
  return through2.obj(function(file, enc, next) {
    bufferedContents = file.contents.toString('utf8') + '\n';
    next();
  }, function(done) {
    var existing = fs.readFileSync(filePath, 'utf8');
    bufferedContents = existing + '\n' + bufferedContents;
    var outputFile = new gutil.File({
      cwd: process.cwd(),
      base: path.dirname(filePath),
      path: filePath,
      contents: new Buffer(bufferedContents)
    });
    this.push(outputFile);
    done();
  });
};

exports.buildNgMaterialDefinition = function() {
  var srcBuffer = [];
  var modulesSeen = [];
  var count = 0;
  return through2.obj(function(file, enc, next) {
    var module = findModule.material(file.contents);
    if (module) modulesSeen.push(module.name);
    srcBuffer.push(file);
    next();
  }, function(done) {
    var self = this;
    var requiredLibs = ['ng', 'ngAnimate', 'ngAria'];
    var dependencies = JSON.stringify(requiredLibs.concat(modulesSeen));
    var ngMaterialModule = "angular.module('ngMaterial', " + dependencies + ');';
    var angularFile = new gutil.File({
      base: process.cwd(),
      path: process.cwd() + '/ngMaterial.js',
      contents: new Buffer(ngMaterialModule)
    });

    // Elevate ngMaterial module registration to first in queue
    self.push(angularFile);

    srcBuffer.forEach(function(file) {
      self.push(file);
    });

    srcBuffer = [];
    done();
  });
};

function moduleNameToClosureName(name) {
  // For Closure, all modules start with "ngmaterial". We specifically don't use `ng.`
  // because it conflicts with other packages under `ng.`.
  return 'ng' + name;
}
exports.addJsWrapper = function(enforce) {
  return through2.obj(function(file, enc, next) {
    var module = findModule.any(file.contents);
    if (!!enforce || module) {
      file.contents = new Buffer([
          !!enforce ? '(function(){' : '(function( window, angular, undefined ){',
          '"use strict";\n',
          file.contents.toString(),
          !!enforce ? '})();' : '})(window, window.angular);'
      ].join('\n'));
    }
    this.push(file);
    next();
  });
};
exports.addClosurePrefixes = function() {
  return through2.obj(function(file, enc, next) {
    var module = findModule.any(file.contents);
    if (module) {
      var closureModuleName = moduleNameToClosureName(module.name);
      var requires = (module.dependencies || []).sort().map(function(dep) {
        if (dep.indexOf(module.name) === 0 || /material\..+/g.test(dep) == false) return '';
        return 'goog.require(\'' + moduleNameToClosureName(dep) + '\');';
      }).join('\n');

      file.contents = new Buffer([
          'goog.provide(\'' + closureModuleName + '\');',
          requires,
          file.contents.toString(),
          closureModuleName + ' = angular.module("' + module.name + '");'
      ].join('\n'));
    }
    this.push(file);
    next();
  });
};

exports.buildModuleBower = function(name, version) {
  return through2.obj(function(file, enc, next) {
    this.push(file);
    var module = findModule.any(file.contents);
    if (module) {
      var bowerDeps = {};
      (module.dependencies || []).forEach(function(dep) {
        var convertedName = 'angular-material-' + dep.split('.').pop();
        bowerDeps[convertedName] = version;
      });
      var bowerContents = JSON.stringify({
        name: 'angular-material-' + name,
        version: version,
        dependencies: bowerDeps
      }, null, 2);
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

    var openCount = 0;
    var closeCount = 0;
    var openBlock = false;

    for( var currentLine = 0; currentLine < contents.length; ++currentLine) {
      var line = contents[currentLine];

      if (openBlock || /^\s*\$/.test(line) && !/^\s+/.test(line)) {
        openCount += (line.match(/\(/g) || []).length;
        closeCount += (line.match(/\)/g) || []).length;
        openBlock = openCount != closeCount;
        var variable = contents.splice(currentLine, 1)[0];
        contents.splice(++lastVariableLine, 0, variable);
      }
    }
    file.contents = new Buffer(contents.join('\n'));
    this.push(file);
    next();
  });
};

exports.cssToNgConstant = function(ngModule, factoryName) {
  return through2.obj(function(file, enc, next) {

    var template = '(function(){ \nangular.module("%1").constant("%2", "%3"); \n})();\n\n';
    var output = file.contents.toString().replace(/\n/g, '').replace(/\"/g,'\\"');

    var jsFile = new gutil.File({
      base: file.base,
      path: file.path.replace('css', 'js'),
      contents: new Buffer(
        template.replace('%1', ngModule)
          .replace('%2', factoryName)
          .replace('%3', output)
      )
    });

    this.push(jsFile);
    next();
  });
};

exports.autoprefix = function() {

  return autoprefixer({browsers: [
    'last 2 versions',
    'not ie <= 10',
    'not ie_mob <= 10',
    'last 4 Android versions',
    'Safari >= 8'
  ]});
};
