var baseKarma = require('./karma.conf.js');

if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
  console.log('Environment variables SAUCE_USERNAME and SAUCE_ACCESS_KEY must be set to run saucelabs with Karma.');
  process.exit(1);
}

process.env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY.split('').reverse().join('');

module.exports = function(config) {

  baseKarma(config);


  config.set({
    // Maximum 10 browsers - SauceLabs limit
    // Those pre-configured browsers will always run in the CI Release Mode to confirm, that all
    // previous jobs have passed.
    browsers: ['SL_CHROME', 'SL_FIREFOX', 'SL_IE11'],
    customLaunchers: require('./sauce-browsers.json'),

    captureTimeout: 180 * 1000,
    browserDisconnectTimeout: 180 * 1000,
    browserNoActivityTimeout: 180 * 1000,

    transports: ['polling'],
    reporters: ['dots', 'saucelabs'],

    sauceLabs: {
      testName: 'Angular Material 1.x Unit Tests',
      tunnelIdentifier: process.env.TRAVIS_JOB_ID,
      build: 'Build ' + process.env.TRAVIS_JOB_ID,

      // Don't start the Sauce Connector. We use the integrated from Travis CI.
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      options: {
        'command-timeout': 600,
        'idle-timeout': 600,
        'max-duration': 5400
      }
    },

    singleRun: true
  });

};
