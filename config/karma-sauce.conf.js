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
    browsers: ['SL_CHROME'],
    customLaunchers: require('./sauce-browsers.json'),

    captureTimeout: 180 * 1000,
    browserDisconnectTimeout: 180 * 1000,
    browserNoActivityTimeout: 180 * 1000,

    reporters: ['dots', 'saucelabs'],

    sauceLabs: {
      testName: 'Angular Material 1.x Unit Tests'
    },

    singleRun: true
  });

};
