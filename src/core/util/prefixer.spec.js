describe('prefixer', function() {
  
  beforeEach(module('material.core'));
  
  beforeEach(inject(function($injector) {
    $mdUtil = $injector.get('$mdUtil');
  }));

  describe('when using an initial parameter', function() {

    it('should correctly prefix a single attribute', function() {
      expect($mdUtil.prefixer('ng-click')).toEqual(['ng-click', 'data-ng-click', 'x-ng-click']);
    });

    it('should correctly prefix multiple attributes', function() {
      expect($mdUtil.prefixer(['ng-click', 'ng-href']))
        .toEqual(['ng-click', 'ng-href', 'data-ng-click', 'x-ng-click', 'data-ng-href', 'x-ng-href']);
    });

    it('should correctly build a selector for a single attribute', function() {
      expect($mdUtil.prefixer('ng-click', true)).toBe('[ng-click],[data-ng-click],[x-ng-click]');
    });

    it('should correctly build a selector for multiple attributes', function() {
      expect($mdUtil.prefixer(['ng-click', 'ng-href'], true))
        .toBe('[ng-click],[ng-href],[data-ng-click],[x-ng-click],[data-ng-href],[x-ng-href]');
    });

  });

  describe('when using the returned object', function() {
    var prefixer;

    beforeEach(function() {
      prefixer = $mdUtil.prefixer();
    });

    describe('and building a list', function() {

      it('should correctly prefix a single attribute', function() {
        expect(prefixer.buildList('ng-click')).toEqual(['ng-click', 'data-ng-click', 'x-ng-click']);
      });

      it('should correctly prefix multiple attributes', function() {
        expect(prefixer.buildList(['ng-click', 'ng-href']))
          .toEqual(['ng-click', 'ng-href', 'data-ng-click', 'x-ng-click', 'data-ng-href', 'x-ng-href']);
      });

    });

    describe('and building a selector', function() {

      it('should correctly build for a single attribute', function() {
        expect(prefixer.buildSelector('ng-click')).toBe('[ng-click],[data-ng-click],[x-ng-click]');
      });

      it('should correctly build for multiple attributes', function() {
        expect(prefixer.buildSelector(['ng-click', 'ng-href']))
          .toBe('[ng-click],[ng-href],[data-ng-click],[x-ng-click],[data-ng-href],[x-ng-href]');
      });
    });

    describe('and checking for an attribute', function() {

      it('should correctly detect a prefixed attribute', function() {
        var element = angular.element('<div data-ng-click="null">');

        expect(prefixer.hasAttribute(element, 'ng-click')).toBe(true);
      });

      it('should correctly detect an un-prefixed attribute', function() {
        var element = angular.element('<div ng-click="null">');

        expect(prefixer.hasAttribute(element, 'ng-click')).toBe(true);
      });

      it('should not throw an error if element is undefined', function() {
        // Create an empty jqLite element to test if it does throw an error.
        var emptyElement = angular.element();

        expect(function() {
          prefixer.hasAttribute(emptyElement, 'ng-click')
        }).not.toThrow();
      });

    });

    describe('and removing an attribute', function() {

      it('should remove a prefixed attribute', function() {
        var element = angular.element('<div data-ng-click="null">')[0];

        prefixer.removeAttribute(element, 'ng-click');

        expect(element.hasAttribute('data-ng-click')).toBeFalsy();
      });

      it('should remove an un-prefixed attribute', function() {
        var element = angular.element('<div ng-click="null">')[0];

        prefixer.removeAttribute(element, 'ng-click');

        expect(element.hasAttribute('ng-click')).toBeFalsy();
      });

      it('should remove prefixed and un-prefixed attributes', function() {
        var element = angular.element('<div ng-click="null" data-ng-click="null">')[0];

        prefixer.removeAttribute(element, 'ng-click');

        expect(prefixer.hasAttribute(element, 'ng-click')).toBeFalsy();
      });

      it('should not throw an error if element is undefined', function() {
        // Create an empty jqLite element to test if it does throw an error.
        var emptyElement = angular.element();

        expect(function() {
          prefixer.removeAttribute(emptyElement, 'ng-click');
        }).not.toThrow();
      });

    });

  });
  
});