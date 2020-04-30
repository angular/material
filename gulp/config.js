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
  jsCoreFiles: [
    'src/core/*.js',
    'src/core/util/autofocus.js',
    'src/core/util/color.js',
    'src/core/util/constant.js',
    'src/core/util/iterator.js',
    'src/core/util/media.js',
    'src/core/util/prefixer.js',
    'src/core/util/util.js',
    'src/core/util/animation/animate.js',
    'src/core/util/animation/animateCss.js',
    'src/core/services/aria/*.js',
    'src/core/services/compiler/*.js',
    'src/core/services/gesture/*.js',
    'src/core/services/interaction/*.js',
    'src/core/services/interimElement/*.js',
    'src/core/services/layout/*.js',
    'src/core/services/liveAnnouncer/*.js',
    'src/core/services/meta/*.js',
    'src/core/services/registry/*.js',
    'src/core/services/ripple/button_ripple.js',
    'src/core/services/ripple/checkbox_ripple.js',
    'src/core/services/ripple/list_ripple.js',
    'src/core/services/ripple/ripple.js',
    'src/core/services/ripple/tab_ripple.js',
    'src/core/services/theming/theme.palette.js',
    'src/core/services/theming/theming.js'
  ],
  jsHintFiles: [
    'src/**/*.js',
    '!src/**/*.spec.js'
  ],
  componentPaths: [
    'src/components/autocomplete',
    'src/components/backdrop',
    'src/components/bottomSheet',
    'src/components/button',
    'src/components/card',
    'src/components/checkbox',
    'src/components/chips',
    'src/components/colors',
    'src/components/content',
    'src/components/datepicker',
    'src/components/dialog',
    'src/components/divider',
    'src/components/fabActions',
    'src/components/fabSpeedDial',
    'src/components/fabToolbar',
    'src/components/gridList',
    'src/components/icon',
    'src/components/input',
    'src/components/list',
    'src/components/menu',
    'src/components/menuBar',
    'src/components/navBar',
    'src/components/panel',
    'src/components/progressCircular',
    'src/components/progressLinear',
    'src/components/radioButton',
    'src/components/select',
    'src/components/showHide',
    'src/components/sidenav',
    'src/components/slider',
    'src/components/sticky',
    'src/components/subheader',
    'src/components/swipe',
    'src/components/switch',
    'src/components/tabs',
    'src/components/toast',
    'src/components/toolbar',
    'src/components/tooltip',
    'src/components/truncate',
    'src/components/virtualRepeat',
    'src/components/whiteframe'
  ],
  inputVariables: 'src/components/input/_input-variables.scss',
  mockFiles: [
    'test/angular-material-mocks.js'
  ],
  themeBaseFiles: [
    'src/core/style/_variables.scss',
    'src/core/style/_mixins.scss'
  ],
  themeCore: 'src/core/style/core-theme.scss',
  scssBaseFiles: [
    'src/core/style/color-palette.scss',
    'src/core/style/_variables.scss',
    'src/components/input/_input-variables.scss',
    'src/core/style/_mixins.scss',
    'src/core/style/structure.scss',
    'src/core/style/typography.scss',
    'src/core/style/layout.scss',
    'src/components/panel/*.scss'
  ],
  scssServicesLayout: 'src/core/services/layout/layout.scss',
  scssLayoutFiles: [
    'src/core/style/_variables.scss',
    'src/core/style/_mixins.scss',
    'src/core/style/layout.scss',
    'src/core/services/layout/layout.scss'
  ],
  scssLayoutAttributeFiles: [
    'src/core/style/_variables.scss',
    'src/core/style/_mixins.scss',
    'src/core/services/layout/layout-attributes.scss'
  ],
  scssComponentPaths: [
    'src/components/autocomplete',
    'src/components/backdrop',
    'src/components/bottomSheet',
    'src/components/button',
    'src/components/card',
    'src/components/checkbox',
    'src/components/chips',
    'src/components/content',
    'src/components/datepicker',
    'src/components/dialog',
    'src/components/divider',
    'src/components/fabSpeedDial',
    'src/components/fabToolbar',
    'src/components/gridList',
    'src/components/icon',
    'src/components/input',
    'src/components/list',
    'src/components/menu',
    'src/components/menuBar',
    'src/components/navBar',
    // panel is included in scssBaseFiles above
    'src/components/progressCircular',
    'src/components/progressLinear',
    'src/components/radioButton',
    'src/components/select',
    'src/components/sidenav',
    'src/components/slider',
    'src/components/sticky',
    'src/components/subheader',
    'src/components/swipe',
    'src/components/switch',
    'src/components/tabs',
    'src/components/toast',
    'src/components/toolbar',
    'src/components/tooltip',
    'src/components/truncate',
    'src/components/virtualRepeat',
    'src/components/whiteframe'
  ],
  cssIEPaths: ['src/**/ie_fixes.css'],
  outputDir: 'dist/'
};
