var baseKarma = require('./karma.conf.js');

module.exports = function(config) {
  baseKarma(config);

  // Override defaults with custom CI settings
  config.set({
    colors: false,
    singleRun:true,
    autoWatch: false,
    logLevel: config.LOG_DEBUG,

    // Only launch one browser at a time since doing multiple can cause disconnects/issues
    concurrency: 1,

    browsers: ['Firefox'],

    client: {
      // Do not clear the context as this can cause reload failures with Jasmine
      clearContext:false
    },

    // This is the new content for your travis-ci configuration test
    //  Custom launcher for Travis-CI
    customLaunchers: {
        Chrome_travis_ci: {
            base: 'Chrome',
            flags: ['--no-sandbox']
        }
    }
  });

  var browsers = process.env.TRAVIS ? ['Chrome_travis_ci'] : [];
  config.browsers = browsers.concat(config.browsers);

};
