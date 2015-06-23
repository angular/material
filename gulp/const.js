var config = require('./config');
var path = require('path');
var args = require('minimist')(process.argv.slice(2));
var utils = require('../scripts/gulp-utils.js');

exports.ROOT       = path.normalize(__dirname + '/..');
exports.VERSION    = args.version || require('../package.json').version;
exports.LR_PORT    = args.port || args.p || 8080;
exports.IS_DEV     = args.dev;
exports.SHA        = args.sha;
exports.BUILD_MODE = getBuildMode();

function getBuildMode () {
  var mode = (args.module || args.m || args.c) ? 'demos' : args.mode;
  switch (mode) {
    case 'closure': return {
      name: 'closure',
      transform: utils.addClosurePrefixes,
      outputDir: path.join(config.outputDir, 'modules/closure') + path.sep,
      useBower: false
    };
    case 'demos': return {
      name: 'demos',
      transform: utils.addJsWrapper,
      outputDir: path.join(config.outputDir, 'demos') + path.sep,
      useBower: false
    };
    default: return {
      name: 'default',
      transform: utils.addJsWrapper,
      outputDir: path.join(config.outputDir, 'modules/js') + path.sep,
      useBower: true
    };
  }
}
