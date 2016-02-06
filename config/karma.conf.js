
module.exports = function(config) {

  var UNCOMPILED_SRC = [

    // To enabled use of `gulp karma-watch`,
    // don't use the dist/angular-material.js
    //
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

  var COMPILED_SRC = [
    'dist/angular-material.min.css',
    'dist/angular-material.min.js',   // Minified source
    'src/**/*.spec.js'
  ];

  var dependencies = process.env.KARMA_TEST_JQUERY ? ['node_modules/jquery/dist/jquery.js'] : [];
      dependencies = dependencies.concat([
        'node_modules/angular/angular.js',
        'node_modules/angular-animate/angular-animate.js',
        'node_modules/angular-aria/angular-aria.js',
        'node_modules/angular-sanitize/angular-sanitize.js',
        'node_modules/angular-touch/angular-touch.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'test/angular-material-mocks.js',
        'test/angular-material-spec.js'
      ]);

  var testSrc = process.env.KARMA_TEST_COMPRESSED ? COMPILED_SRC : UNCOMPILED_SRC;

  config.set({

    basePath: __dirname + '/..',
    frameworks: ['jasmine'],
    files: dependencies.concat(testSrc),

    logLevel: config.LOG_DEBUG,
    port: 9876,
    reporters: ['progress'],
    colors: true,

    // Continuous Integration mode
    // enable / disable watching file and executing tests whenever any file changes
    singleRun: true,
    autoWatch: false,

    // Only launch one browser at a time since doing multiple can cause disconnects/issues
    concurrency: 1,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Firefox', 'PhantomJS'],

    // you can define custom flags
    customLaunchers: {
      Chrome_without_security: {
        base: 'Chrome',
        flags: ['--disable-web-security']
      },
      PhantomJS_without_security: {
        base: 'PhantomJS',
        options : {
          onResourceRequested : function (request) {
              console.log('Request ' + JSON.stringify(request, undefined, 4));
          },
          onError : function (msg, trace) {
              console.log(msg);
              trace.forEach(function(item) {
                  console.log('  ', item.file, ':', item.line);
              });
          }
        },
        flags: [
          '--web-security=no',
          '--proxy-type=none',
          '--remote-debugger-port=9000',
          '--remote-debugger-autorun=yes'
        ]
      }
    }
  });

};
