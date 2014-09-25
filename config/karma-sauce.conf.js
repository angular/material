var buildConfig = require('./build.config.js');
var karmaConf = require('./karma.conf.js');
var _ = require('lodash');

if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
  console.log('Environment variables SAUCE_USERNAME and SAUCE_ACCESS_KEY must be set to run saucelabs with Karma.');
  process.exit(1);
}

// Browsers to run on Sauce Labs
var customLaunchers = {
  'SL_Firefox': {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '26'
  },
  'SL_Safari': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.9',
    version: '7'
  },
  'SL_IE_10': {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 2012',
    version: '10'
  },
  'SL_IE_11': {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  },
  'SL_iOS_7': {
    base: 'SauceLabs',
    browserName: 'Safari',
    platformVersion: '7.1',
    'appium-version': '1.0',
    platformName: 'iOS',
    deviceName: 'iPhone Simulator'
  },
  'SL_Android_4.4': {
    base: 'SauceLabs',
    browserName: 'android',
    'appium-version': '1.0',
    deviceName: 'Android',
    platform: 'Linux',
    version: '4.4'
  },
  'SL_Android_4.3': {
    base: 'SauceLabs',
    browserName: 'android',
    deviceName: 'Android',
    platform: 'Linux',
    version: '4.3'
  },
  'SL_Android_4.2': {
    base: 'SauceLabs',
    browserName: 'android',
    deviceName: 'Android',
    platform: 'Linux',
    version: '4.2'
  },
  'SL_Android_4.1': {
    base: 'SauceLabs',
    browserName: 'android',
    deviceName: 'Android',
    platform: 'Linux',
    version: '4.1'
  },
  'SL_Android_4.0': {
    base: 'SauceLabs',
    browserName: 'android',
    deviceName: 'Android',
    platform: 'Linux',
    version: '4.0'
  },
};

module.exports = _.assign({}, karmaConf, {

  // Maximum 10 browsers - saucelabs limit
  // browsers: Object.keys(customLaunchers),
  browsers: ['SL_IE_10', 'SL_IE_11'],
  customLaunchers: customLaunchers,

  captureTimeout: 180 * 1000,
  browserDisconnectTimeout: 180 * 1000,
  browserNoActivityTimeout: 180 * 1000,

  reporters: ['dots', 'saucelabs'],

  sauceLabs: {
    testName: 'Angular material unit tests'
  },

  singleRun: true
});
