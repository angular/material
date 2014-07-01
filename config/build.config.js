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

  componentsModule: "angular.module('ngMaterial', [ 'ng', 'ngAnimate', 'material.services', <%= components.join(',') %>]);\n",

  dist: 'dist',
  docsDist: 'dist/docs',

  paths: {
    scss: 'src/main.scss',
    js: [
      'src/{services,components,utils}/**/*.js', 
      '!src/{services,components,utils}/**/*.spec.js'
    ],
    test: 'src/**/*.spec.js'
  },

  repository: pkg.repository.url
    .replace(/^git:/,'https:')
    .replace(/(\.git)?\/?$/,'')
  
};
