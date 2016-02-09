var gulp = require('gulp');
var protractor = require("gulp-protractor").protractor;
var sauceConnectLauncher = require('sauce-connect-launcher');
var connect = require('gulp-connect');

var port = 9000;

exports.dependencies = [];

exports.task = function(cb) {
  var sauceProcess;
  
  // Start the web server
  connect.server({
    root: './dist/docs',
    livereload: false,
    port: port,
    debug: false
  });

  // Check for Travis and start the Sauce Connect process
  if (process.env['TRAVIS']) {
    sauceConnectLauncher({
      username: process.env['SAUCE_USERNAME'],
      accessKey: process.env['SAUCE_ACCESS_KEY'].split('').reverse().join(''),
      tunnelIdentifier: process.env['TRAVIS_JOB_NUMBER'],
      verbose: true,
      logger: console.log
    }, function(err, sauceConnectProcess) {
      if (err) {
        console.error('  Protractor - Sauce Connect - Error - ', err.message);
        cb();
        process.exit();
      }

      console.log('  Protractor - Sauce Connect - Ready');

      gulpProtractor(function() {
        // First close our SauceConnect
        sauceConnectProcess.close(function() {
          console.log('  Protractor - Sauce Connect - Closed Process');
        });

        // Then call the gulp callback
        cb();
      });
    });
  } else {
    gulpProtractor(cb);
  }

};

function gulpProtractor(cb) {
  gulp.src(['test/e2e/*.js'])
    .pipe(protractor({
      configFile: "./config/protractor.conf.js"
    }))
    .on('end', function() {
      connect.serverClose();
      cb();
      process.exit()
    })
    .on('error', function(e) {
      connect.serverClose();
      console.error(e);
      cb();
      process.exit()
    });
}
