// Used for running unit tests against the docs site
// Unit tests can be run using gulp docs-karma
module.exports = function(config) {

  var UNCOMPILED_SRC = [
    'docs/spec/**/*.spec.js'
  ];

  // releaseMode is a custom configuration option.
  var testSrc = UNCOMPILED_SRC;
  var dependencies = process.env.KARMA_TEST_JQUERY ?
    ['node_modules/jquery/dist/jquery.js'] : [];

  dependencies = dependencies.concat([
    'node_modules/angular/angular.js',
    'node_modules/angular-animate/angular-animate.js',
    'node_modules/angular-aria/angular-aria.js',
    'node_modules/angular-messages/angular-messages.js',
    'node_modules/angular-route/angular-route.js',
    'node_modules/angular-mocks/angular-mocks.js',
    'dist/angular-material.js',
    'config/test-utils.js',
    'dist/docs/docs.js',
    'dist/docs/docs-demo-scripts.js'
  ]);

  config.set({

    basePath: __dirname + '/..',
    frameworks: ['jasmine'],
    files: dependencies.concat(testSrc),

    port: 9877,
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
