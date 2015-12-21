/*
 * Provides a test utility for taking screenshots of PhantomJS. Add the function below to your
 * `*.spec.js` file and call `screenshot('my-screenshot')` from within the test. Make sure to call
 * `screenshot('my-last-screenshot', true)` to kill this script, or you can manually kill it with
 * Ctrl+C in the terminal.
 *
 * Once the below code has been added, and you have started Karma (the server must be running),
 * launch this script by running `phantomjs phantom-screenshot.js` and it will connect to the
 * running Karma instance, take the requested screenshots, and die.
 *
 * All screenshots are stored in the `screenshots` directory.
 *
 *     function screenshot(filename, done) {
 *       // Attempt to take a screenshot, but fail silently if we can't
 *       if (typeof window.callPhantom != 'undefined') {
 *         window.callPhantom({ filename: filename + '.png', done: done });
 *       }
 *     }
 *
 */
var page = require("webpage").create();

page.onCallback = function(userData) {
  var data = userData || {};
  var options = {
    filename: data.filename || 'phantom-screenshot.png',
    done: data.done || false
  };

  if (options.filename) {
    console.log('PSS - Rendering screenshot: screenshots/', options.filename);
    page.render('screenshots/' + options.filename);
  }

  if (options.done) {
    console.log ('PSS - Done! Exiting screenshot system.');
    phantom.exit();
  }
};

page.open("http://localhost:9876/debug.html");
