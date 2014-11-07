
module.exports = function(config) {
  config.set({

    basePath: __dirname + '/..',
    frameworks: ['jasmine'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/hammerjs/hammer.js',
      'config/test-utils.js',
      'src/core/**/*.js',

      // We are explicit like this because we don't want to put
      // demos in the tests, and Karma doesn't support advanced
      // globbing.
      'src/components/*/*.js',
      'src/components/tabs/js/*.js',
      'src/services/*.js',
      'src/services/*/*.js', 
    ],

    port: 9876,
    reporters: ['progress'],
    colors: true,

    // Continuous Integration mode
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
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
  });

};
