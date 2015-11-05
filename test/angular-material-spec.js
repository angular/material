/**
 * angular-material-spec.js
 *
 * This Jasmine configuration file is used internally for testing the
 * unit test files: "\angular\material\src\**\*.spec.js"
 *
 */
(function() {


  // Patch since PhantomJS does not implement click() on HTMLElement. In some 
  // cases we need to execute the native click on an element. However, jQuery's 
  // $.fn.click() does not dispatch to the native function on <a> elements, so we
  // can't use it in our implementations: $el[0].click() to correctly dispatch.
  // Borrowed from https://stackoverflow.com/questions/15739263/phantomjs-click-an-element
  if (!HTMLElement.prototype.click) {
    HTMLElement.prototype.click = function() {
      var ev = document.createEvent('MouseEvent');
      ev.initMouseEvent(
        'click',
        /*bubble*/true, /*cancelable*/true,
        window, null,
        0, 0, 0, 0, /*coordinates*/
        false, false, false, false, /*modifier keys*/
        0/*button=left*/, null
      );
      this.dispatchEvent(ev);
    };
  }

  var enableAnimations;

  afterEach(function() {
    enableAnimations && enableAnimations();
    enableAnimations = null;
  });

  beforeEach(function() {

    /**
     * Before each test, require that the 'ngMaterial-mock' module is ready for injection
     * NOTE: assumes that angular-material-mocks.js has been loaded.
     */

    module('ngAnimate');
    module('ngMaterial-mock');

    module(function() {
      return function($mdUtil, $rootElement, $document, $animate) {
        var DISABLE_ANIMATIONS = 'disable_animations';

        // Create special animation 'stop' function used
        // to set 0ms durations for all animations and transitions

        window.disableAnimations = function disableAnimations() {
          var body = angular.element($document[0].body);
          var head = angular.element($document[0].getElementsByTagName('head')[0]);
          var styleSheet = angular.element( buildStopTransitions() );

          $animate.enabled(false);

          head.prepend(styleSheet);
          body.addClass(DISABLE_ANIMATIONS);

          // Prepare auto-restore
          enableAnimations = function() {
            body.removeClass(DISABLE_ANIMATIONS);
            styleSheet.remove();
          };
        };

        /**
         * Build stylesheet to set all transition and animation
         * durations' to zero.
         */
        function buildStopTransitions() {
          var style = "<style> .{0} * { {1} }</style>";

          return $mdUtil.supplant(style,[ DISABLE_ANIMATIONS,
            "transition -webkit-transition animation -webkit-animation"
                .split(" ")
                .map(function(key){
                  return $mdUtil.supplant("{0}: 0s none !important",[key]);
                })
                .join("; ")
          ]);

        }

      };
    });

    /**
     * Mocks angular.element#focus ONLY for the duration of a particular test.
     *
     * @example
     *
     * it('some focus test', inject(function($document)
     * {
     *   jasmine.mockElementFocus(this); // 'this' is the test instance
     *
     *   doSomething();
     *   expect($document.activeElement).toBe(someElement[0]);
     *
     * }));
     *
     */
    jasmine.mockElementFocus = function(test) {
      var focus = angular.element.prototype.focus;
      inject(function($document) {
        angular.element.prototype.focus = function() {
          $document.activeElement = this[0];
        };
      });
      // Un-mock focus after the test is done
      afterEach(function() {
        angular.element.prototype.focus = focus;
      });
    };

    /**
     * Add special matchers used in the Angular-Material specs
     *
     */
    jasmine.addMatchers({

      toHaveClass: function() {
        return {
          compare: function(actual, expected) {
            var results = {pass: true};
            var classes = expected.trim().split(/\s+/);

            for (var i = 0; i < classes.length; ++i) {
              if (!angular.element(actual).hasClass(classes[i])) {
                results.pass = false;
              }
            }

            var negation = !results.pass ? "" : " not ";

            results.message = "";
            results.message += "Expected '";
            results.message += angular.mock.dump(actual);
            results.message += negation + "to have class '" + expected + "'.";

            return results;
          }
        };
      },

      /**
       * A helper to match the type of a given value
       * @example expect(1).toBeOfType('number')
       */
      toBeOfType: function(type) {
        return {
          compare: function(actual, expected) {
            var results = {
              pass: typeof actual == expected
            };

            var negation = !results.pass ? "" : " not ";

            results.message = "";
            results.message += "Expected ";
            results.message += angular.mock.dump(actual) + " of type ";
            results.message += (typeof actual);
            results.message += negation + "to have type '" + type + "'.";

            return results;
          }
        };
      },

      toHaveFields: function() {
        return {
          compare: function(actual, expected) {
            var results = {pass: true};

            for (var key in expected) {
              if (!(actual || {}).hasOwnProperty(key) || !angular.equals(actual[key], expected[key])) {
                results.pass = false;
              }
            }

            var negation = !results.pass ? "" : " not ";

            results.message = "";
            results.message += "Expected ";
            results.message += angular.mock.dump(actual) + " of type ";
            results.message += (typeof actual);
            results.message += negation + "to have fields matching '" + angular.mock.dump(expected);

            return results;
          }
        };
      }

    });

  });

})();
