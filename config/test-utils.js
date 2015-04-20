var TestUtil = {
  /**
   * Mocks angular.element#focus for the duration of the test
   * @example
   * it('some focus test', inject(function($document) {
   *   TestUtil.mockFocus(this); // 'this' is the test instance
   *   doSomething();
   *   expect($document.activeElement).toBe(someElement[0]);
   * }));
   */
  mockElementFocus: function(test) {
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
  },

};

beforeEach(function() {

  /**
   * Create a fake version of $$rAF that does things synchronously
   */
  module('ng', function($provide) {
    $provide.value('$$rAF', mockRaf);

    function mockRaf(cb) {
      cb();
    }
    mockRaf.throttle = function(cb) {
      return function() {
        cb.apply(this, arguments);
      };
    };
    mockRaf.flush = angular.noop;

  });

  jasmine.addMatchers({

    toHaveClass: function() {
      return {
        compare: function(actual, expected) {
          var results = { pass : true };
          var classes = expected.trim().split(/\s+/);

          for (var i=0; i<classes.length; ++i) {
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
              pass : typeof actual == expected
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
          var results = { pass : true  };

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
