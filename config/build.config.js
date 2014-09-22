var fs = require('fs');
var pkg = require('../package.json');
var bower = require('../bower.json');

module.exports = {
  banner:
    '/*!\n' +
    ' * Angular Material Design\n' +
    ' * https://github.com/angular/material\n' +
    ' * @license MIT\n' +
    ' * v' + bower.version + '\n' + 
    ' */\n',
  closureStart: '(function(){\n',
  closureEnd: '\n})();',

  //TODO make better
  components: fs.readdirSync(__dirname + '/../src/components')
    .map(function(folder) {
      try {
        var json = require(__dirname + '/../src/components/' + folder + '/module.json');
        return json.module;
      } catch(e) {
        return null;
      }
    })
    .filter(function(module) {
      return !!module;
    }),

  componentsModule: "angular.module('ngMaterial', [ 'ng', 'ngAnimate', 'material.services.attrBind', 'material.services.compiler', 'material.services.registry', 'material.decorators', 'material.services.aria', <%= components.join(',') %>]);\n",

  dist: 'dist',

  docsDist: 'dist/docs',
  docsLib: 'dist/docs/lib',
  docsVersionFile: './dist/docs/version.json', // Writing to dist/ to avoid version-managed docs
  docsAssets: {
    js: [
      'bower_components/angularytics/dist/angularytics.js',
      'dist/angular-material.js',
      'bower_components/hammerjs/hammer.js',
      'dist/docs/js/**/*.js',
      'dist/docs/generated/**/demo/**/*.js',
    ],
    css: [
      'dist/angular-material.css',
      'docs/app/css/highlightjs-github.css',
      'docs/app/css/layout-demo.css',
      'docs/app/css/style.css',
    ]
  },
  demoAssets: {
    js: [
      'dist/angular-material.js'
    ],
    css: [
      'dist/angular-material.css'
    ]
  },

  paths: {
    scss: ['src/main.scss'],
    //We have to manually list files so demo files don't get 
    //into the build
    js: [
      //Utilities
      'src/core/**/*.js',
      '!src/core/**/*.spec.js',

      // Ink Components
      'src/components/animate/effects.js',
      'src/components/animate/noEffect.js',
      'src/components/animate/inkCssRipple.js',

      // Components
      'src/components/buttons/buttons.js',
      'src/components/card/card.js',
      'src/components/checkbox/checkbox.js',
      'src/components/content/content.js',
      'src/components/dialog/dialog.js',
      'src/components/textField/textField.js',
      'src/components/icon/icon.js',
      'src/components/list/list.js',
      'src/components/radioButton/radioButton.js',
      'src/components/sidenav/sidenav.js',
      'src/components/slider/slider.js',
      'src/components/switch/switch.js',
      'src/components/tabs/tabs.js',
      'src/components/tabs/js/*.js',
      'src/components/toast/toast.js',
      'src/components/toolbar/toolbar.js',
      'src/components/whiteframe/whiteframe.js',
      'src/components/divider/divider.js',
      'src/components/linearProgress/linearProgress.js',

      //Services
      'src/services/decorators.js',
      'src/services/aria/aria.js',
      'src/services/attrBind/attrBind.js',
      'src/services/compiler/compiler.js',
      'src/services/registry/registry.js',
      'src/services/throttle/throttle.js'
    ],
    test: [
      'src/**/*.spec.js',
    ]
  },

  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,'')
  
};
