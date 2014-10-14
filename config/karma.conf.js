var buildConfig = require('./build.config.js');

module.exports = {
  basePath: __dirname + '/..',
  frameworks: ['jasmine'],
  files: [
    // Include jQuery just for its dom helpers for testing, eg el.trigger()
    'bower_components/jquery/dist/jquery.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-aria/angular-aria.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'bower_components/hammerjs/hammer.js',
    'config/test-utils.js',
    'src/core/**/*.js',
    'src/{components,services}/*.js',
    'src/{components,services}/*/*.js', // Don't put demos in the tests
  ],

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
