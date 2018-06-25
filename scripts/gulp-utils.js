const gulp = require('gulp');
const through2 = require('through2');
const gutil = require('gulp-util');
const autoprefixer = require('gulp-autoprefixer');
const Buffer = require('buffer').Buffer;
const fs = require('fs');
const path = require('path');
const findModule = require('../config/ngModuleData.js');

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
    const demoID = component + "/" + path.basename(demo.path);
    const demoDir = demo.path + "/**/*";

    const notJS  = '!' + demoDir + '.js';
    const notCSS = '!' + demoDir + '.css';
    const notHTML= '!' + demoDir + '.html';

    gulp.src([demoDir, notJS, notCSS, notHTML])
        .pipe(gulp.dest(distDir + demoID));

    next();
  }
};

// Gives back a pipe with an array of the parsed data from all of the module's demos
// @param moduleName module name to parse
// @param fileTasks: tasks to run on the files found in the demo's folder
// Emits demo objects
exports.readModuleDemos = function(moduleName, fileTasks) {
  const name = moduleName.split('.').pop();
  return gulp.src('src/{components,services}/' + name + '/demo*/')
    .pipe(through2.obj(function(demoFolder, enc, next) {
      const demoId = name + path.basename(demoFolder.path);

      const demo = {
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
            const fileType = path.extname(file.path).substring(1);
            if (fileType === 'js') {
              demo.ngModule = demo.ngModule || findModule.any(file.contents.toString());
            }
            demo[fileType] && demo[fileType].push(toDemoObject(file));
          }
          cb();
        }, function() {
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

const pathsForModules = {};

exports.pathsForModule = function(name) {
  return pathsForModules[name] || lookupPath();

  function lookupPath() {
    gulp.src('src/{services,components,core}/**/*')
          .pipe(through2.obj(function(file, enc, next) {
            const module = findModule.any(file.contents);
            if (module && module.name === name) {
              const modulePath = file.path.split(path.sep).slice(0, -1).join(path.sep);
              pathsForModules[name] = modulePath + '/**';
            }
            next();
          }));
    return pathsForModules[name];
  }
};

exports.filesForModule = function(name) {
  if (pathsForModules[name]) {
    return srcFiles(pathsForModules[name]);
  } else {
    return gulp.src('src/{services,components,core}/**/*')
      .pipe(through2.obj(function(file, enc, next) {
        const module = findModule.any(file.contents);
        if (module && (module.name === name)) {
          const modulePath = file.path.split(path.sep).slice(0, -1).join(path.sep);
          pathsForModules[name] = modulePath + '/**';
          const self = this;
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
  let bufferedContents;
  return through2.obj(function(file, enc, next) {
    bufferedContents = file.contents.toString('utf8') + '\n';
    next();
  }, function(done) {
    const existing = fs.readFileSync(filePath, 'utf8');
    bufferedContents = existing + '\n' + bufferedContents;
    const outputFile = new gutil.File({
      cwd: process.cwd(),
      base: path.dirname(filePath),
      path: filePath,
      contents: Buffer.from(bufferedContents)
    });
    this.push(outputFile);
    done();
  });
};

exports.buildNgMaterialDefinition = function() {
  let srcBuffer = [];
  const modulesSeen = [];
  return through2.obj(function(file, enc, next) {
    const module = findModule.material(file.contents);
    if (module) modulesSeen.push(module.name);
    srcBuffer.push(file);
    next();
  }, function(done) {
    const self = this;
    const requiredLibs = ['ng', 'ngAnimate', 'ngAria'];
    const dependencies = JSON.stringify(requiredLibs.concat(modulesSeen));
    const ngMaterialModule = "angular.module('ngMaterial', " + dependencies + ');';
    const angularFile = new gutil.File({
      base: process.cwd(),
      path: process.cwd() + '/ngMaterial.js',
      contents: Buffer.from(ngMaterialModule)
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
    const module = findModule.any(file.contents);
    if (!!enforce || module) {
      file.contents = Buffer.from([
          enforce ? '(function(){' : '(function( window, angular, undefined ){',
          '"use strict";\n',
          file.contents.toString(),
          enforce ? '})();' : '})(window, window.angular);'
      ].join('\n'));
    }
    this.push(file);
    next();
  });
};
exports.addClosurePrefixes = function() {
  return through2.obj(function(file, enc, next) {
    const module = findModule.any(file.contents);
    if (module) {
      const closureModuleName = moduleNameToClosureName(module.name);
      const requires = (module.dependencies || []).sort().map(function(dep) {
        if (dep.indexOf(module.name) === 0 || /material\..+/g.test(dep) === false) return '';
        return 'goog.require(\'' + moduleNameToClosureName(dep) + '\');';
      }).join('\n');

      file.contents = Buffer.from([
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
    const module = findModule.any(file.contents);
    if (module) {
      const bowerDeps = {};
      (module.dependencies || []).forEach(function(dep) {
        const convertedName = 'angular-material-' + dep.split('.').pop();
        bowerDeps[convertedName] = version;
      });
      const bowerContents = JSON.stringify({
        name: 'angular-material-' + name,
        version: version,
        dependencies: bowerDeps
      }, null, 2);
      const bowerFile = new gutil.File({
        base: file.base,
        path: file.base + '/bower.json',
        contents: Buffer.from(bowerContents)
      });
      this.push(bowerFile);
    }
    next();
  });
};

exports.hoistScssVariables = function() {
  return through2.obj(function(file, enc, next) {
    const contents = file.contents.toString().split('\n');
    let lastVariableLine = -1;

    let openCount = 0;
    let closeCount = 0;
    let openBlock = false;

    for(let currentLine = 0; currentLine < contents.length; ++currentLine) {
      const line = contents[currentLine];

      if (openBlock || /^\s*\$/.test(line) && !/^\s+/.test(line)) {
        openCount += (line.match(/\(/g) || []).length;
        closeCount += (line.match(/\)/g) || []).length;
        openBlock = openCount !== closeCount;
        const variable = contents.splice(currentLine, 1)[0];
        contents.splice(++lastVariableLine, 0, variable);
      }
    }
    file.contents = Buffer.from(contents.join('\n'));
    this.push(file);
    next();
  });
};

exports.cssToNgConstant = function(ngModule, factoryName) {
  return through2.obj(function(file, enc, next) {

    const template = '(function(){ \nangular.module("%1").constant("%2", "%3"); \n})();\n\n';
    const output = file.contents.toString().replace(/\n/g, '').replace(/"/g,'\\"');

    const jsFile = new gutil.File({
      base: file.base,
      path: file.path.replace('css', 'js'),
      contents: Buffer.from(
        template.replace('%1', ngModule)
          .replace('%2', factoryName)
          .replace('%3', output)
      )
    });

    this.push(jsFile);
    next();
  });
};

/**
 * Use the configuration in the "browserslist" field of the package.json as recommended
 * by the autoprefixer docs.
 * @returns {NodeJS.ReadWriteStream | *}
 */
exports.autoprefix = function() {
  return autoprefixer();
};
