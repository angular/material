var baseKarma = require('./karma.conf.js');

module.exports = function(config) {
  baseKarma(config);

  // Override defaults with custom CI settings
  config.set({
    // Only launch one browser at a time since doing multiple can cause disconnects/issues
    concurrency: 1,

    client: {
      // Do not clear the context as this can cause reload failures with Jasmine
      clearContext:false
    }
  });
};