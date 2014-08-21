var buildConfig = require('./build.config.js');

module.exports = {
  basePath: __dirname + '/..',
  frameworks: ['jasmine'],
  files: [
    'bower_components/angular/angular.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-mocks/angular-mocks.js',
  ]
    .concat(buildConfig.paths.js)
    .concat(buildConfig.paths.test),

  port: 9876,
  reporters: ['progress'],
  colors: true,

  singleRun: false,

  // Start these browsers, currently available:
  // - Chrome
  // - ChromeCanary
  // - Firefox
  // - Opera (has to be installed with `npm install karma-opera-launcher`)
  // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
  // - PhantomJS
  // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
  browsers: ['Chrome']
};
