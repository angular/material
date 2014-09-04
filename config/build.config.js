var fs = require('fs');
var pkg = require('../package.json');

module.exports = {
  banner:
    '/*!\n' +
    ' * Angular Material Design\n' +
    ' * WIP Banner\n' +
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

  componentsModule: "angular.module('ngMaterial', [ 'ng', 'ngAnimate', 'material.services.attrBind', 'material.services.compiler', 'material.services.position', 'material.services.registry', 'material.services.throttle', 'material.decorators', 'material.services.aria', <%= components.join(',') %>]);\n",

  dist: 'dist',

  docsDist: 'dist/docs',
  docsLib: 'dist/docs/lib',
  docsVersionFile: './dist/docs/version.json', // Writing to dist/ to avoid version-managed docs
  docsAssets: {
    js: [
      'bower_components/angularytics/dist/angularytics.js',
      'dist/angular-material.js',
      'dist/docs/js/**/*.js'
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
      'config/lib/angular-animate-sequence/angular-animate-sequence.js',
      'config/lib/angular-animate-sequence/angular-animate-stylers.js',
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
      //Angular Animate Sequence
      'config/lib/angular-animate-sequence/angular-animate-sequence.js',
      'config/lib/angular-animate-sequence/angular-animate-stylers.js',

      //Utilities
      'src/base/iterator.js',
      'src/base/utils.js',
      'src/base/constants.js',

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
      'src/components/form/form.js',
      'src/components/icon/icon.js',
      'src/components/list/list.js',
      'src/components/radioButton/radioButton.js',
      'src/components/sidenav/sidenav.js',
      'src/components/slider/slider.js',
      'src/components/switch/switch.js',
      'src/components/tabs/tabs.js',
      'src/components/tabs/util/*.js',
      'src/components/toast/toast.js',
      'src/components/toolbar/toolbar.js',
      'src/components/whiteframe/whiteframe.js',

      //Services
      'src/services/decorators.js',
      'src/services/aria/aria.js',
      'src/services/attrBind/attrBind.js',
      'src/services/compiler/compiler.js',
      'src/services/position/position.js',
      'src/services/registry/registry.js',
      'src/services/throttle/throttle.js'
    ],
    test: [
      'src/**/*.spec.js',

      // TODO(matias): remove this once the sequencer is placed into the ngAnimate core

      'config/lib/angular-animate-sequence/*.spec.js'
    ]
  },

  repository: pkg.repository.url
    .replace(/^git/,'https')
    .replace(/(\.git)?\/?$/,'')
  
};
