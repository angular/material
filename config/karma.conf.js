
module.exports = function(config) {
  
  var UNCOMPILED_SRC = [
      'config/test-utils.js',
      'src/core/**/*.js',

      // Test utilities, source, and specifications.
      // We are explicit like this because we don't want to put
      // demos in the tests, and Karma doesn't support advanced
      // globbing.
      'src/components/*/*.js',
      'src/components/*/js/*.js'
  ];

  var COMPILED_SRC = [
    // Minified source
    'dist/angular-material.min.js',

    // Test utilties and specifications
    'config/test-utils.js',
    'src/**/*.spec.js'
  ];
  
  // releaseMode is a custom configuration option.
  var testSrc = config.releaseMode ? COMPILED_SRC : UNCOMPILED_SRC;

  config.set({

    basePath: __dirname + '/..',
    frameworks: ['jasmine'],
    files: [
      // Dependencies
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'config/test-utils.js'
    ].concat(testSrc),

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
