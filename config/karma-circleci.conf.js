const baseKarma = require('./karma.conf.js');

module.exports = function(config) {
  baseKarma(config);

  // Override defaults with custom CI settings
  config.set({
    colors: false,
    singleRun: true,
    autoWatch: false,
    browsers: ['ChromeHeadlessNoSandbox', 'FirefoxHeadless'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      },
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
      },
    },
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require('karma-firefox-launcher'),
      require('karma-junit-reporter')
    ],
    junitReporter: {
      outputDir: 'artifacts/junit/karma'
    },
    client: {
      // Do not clear the context as this can cause reload failures with Jasmine
      clearContext: false
    }
  });
};
