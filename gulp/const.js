const config = require('./config');
const path = require('path');
const args = require('minimist')(process.argv.slice(2));
const utils = require('../scripts/gulp-utils.js');
const version = require('../package.json').version;

exports.ROOT       = path.normalize(path.join(__dirname, '/..'));
exports.VERSION    = args.version || version;
exports.LR_PORT    = args.port || args.p || 8080;
exports.IS_DEV     = args.dev;
exports.SHA        = args.sha;
exports.BUILD_MODE = getBuildMode();

function getBuildMode () {
  const mode = (args.module || args.m || args.c) ? 'demos' : args.mode;
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
