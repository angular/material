const argsVersion = require('minimist')(process.argv.slice(2)).version;
const currentVersion = require('../package.json').version;
const VERSION = argsVersion || currentVersion;

module.exports = {
  banner:
  '/*!\n' +
  ' * AngularJS Material Design\n' +
  ' * https://github.com/angular/material\n' +
  ' * @license MIT\n' +
  ' * v' + VERSION + '\n' +
  ' */\n',
  jsBaseFiles: [
    'src/core/**/*.js'
  ],
  jsFiles: [
    'src/**/*.js',
    '!src/**/*.spec.js'
  ],
  mockFiles : [
    'test/angular-material-mocks.js'
  ],
  themeBaseFiles: [
    'src/core/style/variables.scss',
    'src/core/style/mixins.scss'
  ],
  scssBaseFiles: [
    'src/core/style/color-palette.scss',
    'src/core/style/variables.scss',
    'src/core/style/mixins.scss',
    'src/core/style/structure.scss',
    'src/core/style/typography.scss',
    'src/core/style/layout.scss',
    'src/components/panel/*.scss'
  ],
  scssLayoutFiles: [
    'src/core/style/variables.scss',
    'src/core/style/mixins.scss',
    'src/core/style/layout.scss',
    'src/core/services/layout/layout.scss'
  ],
  scssLayoutAttributeFiles: [
    'src/core/style/variables.scss',
    'src/core/style/mixins.scss',
    'src/core/services/layout/layout-attributes.scss'
  ],
  scssPaths : [
    'src/components/**/*.scss',
    'src/core/services/**/*.scss'
  ],
  cssIEPaths : ['src/**/ie_fixes.css'],
  paths: 'src/+(components|core)/**',
  outputDir: 'dist/',
  demoFolder: 'demo-partials'
};


