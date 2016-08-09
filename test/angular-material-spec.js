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
     * Mocks the focus method from the HTMLElement prototype for the duration
     * of the running test.
     *
     * The mock will be automatically removed after the test finished.
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
    jasmine.mockElementFocus = function() {
      var _focusFn = HTMLElement.prototype.focus;

      inject(function($document) {
        HTMLElement.prototype.focus = function() {
          $document.activeElement = this;
        };
      });

      // Un-mock focus after the test is done
      afterEach(function() {
        HTMLElement.prototype.focus = _focusFn;
      });

    };

    /**
     * Add special matchers used in the Angular-Material spec.
     */
    jasmine.addMatchers({

      /**
       * Asserts that an element has a given class name.
       * Accepts any of:
       *   {string} - A CSS selector.
       *   {angular.JQLite} - The result of a jQuery query.
       *   {Element} - A DOM element.
       */
      toHaveClass: function() {
        return {
          compare: function(actual, expected) {
            var results = {pass: true};
            var classes = expected.trim().split(/\s+/);

            for (var i = 0; i < classes.length; ++i) {
              if (!getElement(actual).hasClass(classes[i])) {
                results.pass = false;
              }
            }

            var negation = !results.pass ? "" : " not ";

            results.message = "";
            results.message += "Expected '";
            results.message += angular.mock.dump(actual);
            results.message += "'" + negation + "to have class '" + expected + "'.";

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
      },

      /**
       * Asserts that an element has keyboard focus in the DOM.
       * Accepts any of:
       *   {string} - A CSS selector.
       *   {angular.JQLite} - The result of a jQuery query.
       *   {Element} - A DOM element.
       */
      toBeFocused: function() {
        return {
          'compare': function(actual) {
            var pass =  getElement(actual)[0] === document.activeElement;
            var not = pass ? 'not ' : '';
            return {
              'pass': pass,
              'message': 'Expected element ' + not + 'to have focus.'
            };
          }
        };
      },

      /**
       * Asserts that a given selector matches one or more items.
       * Accepts any of:
       *   {string} - A CSS selector.
       *   {angular.JQLite} - The result of a jQuery query.
       *   {Element} - A DOM element.
       */
      toExist: function() {
        return {
          compare: function(actual) {
            var el = getElement(actual);
            var pass = el.length > 0;
            var not = pass ? 'not ' : '';

            return {
              pass: pass,
              message: 'Expected "' + actual +
              '" ' + not + 'to match element(s), ' +
              'but found ' + el.length +
              ' items in the DOM'
            };
          }
        };
      },

      /**
       * Asserts that a given element contains a given substring in
       * its innerHTML property.
       * Accepts any of:
       *   {string} - A CSS selector.
       *   {angular.JQLite} - The result of a jQuery query.
       *   {Element} - A DOM element.
       */
      toContainHtml: function() {
        return {
          compare: function(actual, expected) {
            var el = getElement(actual);
            var html = el.html();
            var pass = html.indexOf(expected) !== -1;
            var not = pass ? 'not ' : '';

            return {
              pass: pass,
              message: 'Expected element ' + not + 'to contain the html ' +
              '[' + expected + '] in [' + html + ']'
            };
          }
        };
      }
    });

    /**
     * Returns the angular element associated with a css selector or element.
     * @param el {string|!angular.JQLite|!Element}
     * @returns {!angular.JQLite}
     */
    function getElement(el) {
      var queryResult = angular.isString(el) ?
          document.querySelector(el) : el;
      return angular.element(queryResult);
    }

  });

})();
