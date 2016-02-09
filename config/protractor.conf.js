var find = require('find');
var path = require('path');

var config = {
  framework: 'jasmine',
  specs: ['../test/e2e/**/*.spec.js'],
  baseUrl: 'http://localhost:9000/'
};

// Check to see if we are running on Travis
if (process.env['TRAVIS']) {
  // Setup SauceLabs Connection
  config.sauceSeleniumAddress = 'localhost:4445/wd/hub';
  config.sauceUser = process.env['SAUCE_USERNAME'];
  config.sauceKey = process.env['SAUCE_ACCESS_KEY'].split('').reverse().join('');
  
  config.capabilities = {
    'browserName': 'chrome',
    'tunnel-identifier': process.env['TRAVIS_JOB_NUMBER'],
    'build': process.env['TRAVIS_BUILD_NUMBER'],
    'name': 'Material 1 E2E Tests'
  }
} else {
  var seleniumDir = path.join(__dirname, '..', 'node_modules', 'webdriver-manager', 'selenium');

  // Dynamically find the proper driver/server JAR
  config.chromeDriver = find.fileSync(/chromedriver_[.0-9]+$/, seleniumDir)[0];
  config.seleniumServerJar = find.fileSync(/selenium-server-standalone-[.0-9]+.jar$/, seleniumDir)[0];

  config.directConnect = true;
  config.capabilities = {
    'browserName': 'chrome'
  };
}

exports.config = config;
