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

    client: {
      // Do not clear the context as this can cause reload failures with Jasmine
      clearContext: false
    }
  });
};
