const path = require('path');

module.exports = function(config) {

  const UNCOMPILED_SRC = [

    // To enable use of `gulp karma-watch`,
    // don't use the dist/angular-material.js.
    //'dist/angular-material.js',   // Un-minified source


    // Test utilities, source, and specifications.
    // We are explicit like this because we don't want to put
    // demos in the tests, and Karma doesn't support advanced
    // globbing.

    'dist/angular-material.css',

    'src/core/**/*.js',
    'src/components/*/*.js',
    'src/components/*/js/*.js',

    'src/**/*.spec.js'
  ];

  const COMPILED_SRC = [
    'dist/angular-material.min.css',
    'dist/angular-material.min.js',   // Minified source
    'src/**/*.spec.js'
  ];

  let dependencies = process.env.KARMA_TEST_JQUERY ? ['node_modules/jquery/dist/jquery.js'] : [];
      dependencies = dependencies.concat([
        'node_modules/angular/angular.js',
        'node_modules/angular-animate/angular-animate.js',
        'node_modules/angular-aria/angular-aria.js',
        'node_modules/angular-messages/angular-messages.js',
        'node_modules/angular-sanitize/angular-sanitize.js',
        'node_modules/angular-touch/angular-touch.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'test/angular-material-mocks.js',
        'test/angular-material-spec.js'
      ]);

  const testSrc = process.env.KARMA_TEST_COMPRESSED ? COMPILED_SRC : UNCOMPILED_SRC;

  config.set({
    basePath: path.join(__dirname, '/..'),
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require('karma-firefox-launcher'),
      require('karma-browserstack-launcher'),
      require('karma-sauce-launcher')
    ],
    frameworks: ['jasmine'],
    files: dependencies.concat(testSrc),

    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 10000,
    captureTimeout: 10000,

    logLevel: config.LOG_DEBUG,
    port: 9876,
    reporters: ['progress'],
    colors: true,

    // Continuous Integration mode
    // enable / disable watching file and executing tests whenever any file changes
    singleRun: false,
    autoWatch: true,

    // Try Websocket for a faster transmission first. Fallback to polling if necessary.
    transports: ['websocket', 'polling'],

    browserConsoleLogOptions: {
      terminal: true,
      level: 'log'
    },

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Firefox', 'Chrome'],

    client: {
      // Do not clear the context as this can cause reload failures with Jasmine
      clearContext: false
    }
  });
};
