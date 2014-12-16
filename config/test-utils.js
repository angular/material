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
    test.after(function() {
      angular.element.prototype.focus = focus;
    });
  },

  /**
   * Create a fake version of $$rAF that does things asynchronously
   */
  mockRaf: function() {
    module('ng', function($provide) {
      $provide.value('$$rAF', mockRaf);

      function mockRaf(cb) {
        cb();
      }
      mockRaf.debounce = function(cb) {
        return function() {
          cb.apply(this, arguments);
        };
      };
    });
  }
};

beforeEach(function() {

  module('material.core.theming', function($mdThemingProvider) {
    // Create a test version of every default palette, using a copy of the below palette.
    var defaultPalette = {
      '50': 'ffebee', '100': 'ffcdd2', '200': 'ef9a9a', '300': 'e57373',
      '400': 'ef5350', '500': 'f44336', '600': 'e53935', '700': 'd32f2f',
      '800': 'c62828', '900': 'b71c1c', 'A100': 'ff8a80', 'A200': 'ff5252', 
      'A400': 'ff1744', 'A700': 'd50000',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100']
    };
    (
      'red pink purple deep-purple indigo blue light-blue cyan teal green light-green lime ' +
      'yellow amber orange deep-orange brown grey blue-grey'
    ).split(' ').forEach(function(themeName) {
      $mdThemingProvider.definePalette(themeName, angular.extend({}, defaultPalette));
    });
  });

  this.addMatchers({
    // toHaveClass matcher from angularjs test helpers
    toHaveClass: function(clazz) {
      this.message = function() {
        return "Expected '" + angular.mock.dump(this.actual) +
          (this.isNot ? ' not' : '') + " to have class '" + clazz + "'.";
      };
      var classes = clazz.trim().split(/\s+/);
      for (var i=0; i<classes.length; ++i) {
        if (!angular.element(this.actual).hasClass(classes[i])) {
          return false;
        }
      }
      return true;
    },
    /**
     * A helper to match the type of a given value
     * @example expect(1).toBeOfType('number')
     */
    toBeOfType: function(type) {
      this.message = function() {
        return "Expected " + angular.mock.dump(this.actual) + " of type " +
          (typeof this.actual) + (this.isNot ? ' not ' : '') + " to have type '" + type + "'.";
      };
      return typeof this.actual == type;
    }
  });

});
