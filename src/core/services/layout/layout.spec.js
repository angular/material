describe('layout directives', function() {
  var suffixes = ['xs', 'gt-xs', 'sm', 'gt-sm', 'md', 'gt-md', 'lg', 'gt-lg', 'xl', 'print'],
    $mdUtil, $compile, pageScope;

  beforeEach(module('material.core', 'material.core.layout'));

  beforeEach(inject(function(_$compile_, _$rootScope_, _$mdUtil_) {
    $mdUtil = _$mdUtil_;
    $compile = _$compile_;
    pageScope = _$rootScope_.$new();
  }));

  describe('using [layout] attributes', function() {

    it("should support attribute without value '<div layout>'", function() {
      var element = $compile('<div layout>Layout</div>')(pageScope);
      expect(element.hasClass("layout")).toBeFalsy();
      expect(element.hasClass("layout-row")).toBeTruthy();
    });

    it('should ignore invalid values', function() {
      var element = $compile('<div layout="humpty">Layout</div>')(pageScope);

      expect( element.attr('layout') ).toBe('humpty');        // original attribute value unmodified
      expect(element.hasClass('layout-humpty')).toBeFalsy();
      expect(element.hasClass("layout-row")).toBeTruthy();    // injected className based on fallback value
    });

    it('should support interpolated values layout-gt-sm="{{direction}}"', function() {
      var element = $compile('<div layout-gt-sm="{{direction}}">Layout</div>')(pageScope);

      pageScope.$apply('direction = "row"');
      expect(element.hasClass('layout-gt-sm-row')).toBeTruthy();

      pageScope.$apply('direction = undefined');
      expect(element.hasClass('layout-gt-sm-row')).toBeTruthy();

      pageScope.$apply('direction = "column"');
      expect(element.hasClass('layout-gt-sm-column')).toBeTruthy();
    });


    /**
     * For all breakpoints,
     *  - Test percentage values
     *  - Test valid non-numerics
     *
     * NOTE: include the '' suffix:  layout='' === layout-row
     */
    var directionValues = ['row', 'column'];

    angular.forEach(directionValues, function(direction) {
      angular.forEach([''].concat(suffixes), function(suffix) {
        var className = suffix ? 'layout-' + suffix : 'layout';
        testWithValue(className, direction);
      });
    });

  });

  describe('using [flex] attributes', function() {
    var allowedValues = [
      'grow', 'initial', 'auto', 'none',
      0, 5, 10, 15, 20, 25,
      30, 33, 34, 35, 40, 45,
      50, 55, 60, 65, 66, 67,
      70, 75, 80, 85, 90, 95, 100
    ];

    it('should support attribute without value "<div flex>"', function() {
      var element = $compile('<div flex>Layout</div>')(pageScope);
      expect(element.hasClass("flex")).toBeTruthy();
      expect(element.hasClass("flex-flex")).toBeFalsy();
    });

    it('should ignore invalid values non-numericals like flex="flex"', function() {
      var element = $compile('<div flex="flex">Layout</div>')(pageScope);
      expect(element.hasClass("flex")).toBeTruthy();
      expect(element.hasClass('flex-flex')).toBeFalsy();
    });

    it('should support interpolated values flex-gt-sm="{{columnSize}}"', function() {
      var scope = pageScope,
        element = $compile('<div flex-gt-sm="{{columnSize}}">Layout</div>')(scope);

      scope.$apply('columnSize = 33');
      expect(element.hasClass('flex-gt-sm-33')).toBeTruthy();

      scope.$apply('columnSize = undefined');
      expect(element.hasClass('flex-gt-sm')).toBeTruthy();
    });

    it('should observe the attribute value and update the layout class(es)', inject(function($rootScope, $compile) {
      var scope = pageScope;
      var element = angular.element($compile('<div flex-gt-md="{{size}}"></div>')(scope));

      expect(element.hasClass('flex-gt-md')).toBe(true);
      expect(element.hasClass('flex-gt-md-size')).toBe(false);

      scope.$apply(function() {
        scope.size = 32;
      });

      expect(element.hasClass('flex-gt-md-32')).toBe(true);

      scope.$apply(function() {
        // This should be rejected/ignored and the fallback "" value used
        scope.size = "fishCheeks";
      });

      expect(element.hasClass('flex-gt-md')).toBe(true);
      expect(element.hasClass('flex-gt-md-fishCheeks')).toBe(false);
    }));

    testAllSuffixesWithValues("flex", allowedValues);
  });

  describe('using [flex-order] attributes', function() {
    var flexOrderValues = [
      -9, -8, -7, -6, -5, -4, -3, -2, -1,
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9
    ];

    it('should support attribute without value "<div flex-order>"', function() {
      var element = $compile('<div flex-order>Layout</div>')(pageScope);
      expect(element.hasClass("flex-order-0")).toBeTruthy();
      expect(element.hasClass("flex-order")).toBeFalsy();
    });

    it('should ignore invalid values non-numericals like flex-order="humpty"', function() {
      var element = $compile('<div flex-order="humpty">Layout</div>')(pageScope);
      expect(element.hasClass("flex-order-0")).toBeTruthy();
      expect(element.hasClass('flex-order-humpty')).toBeFalsy();
    });

    it('should support interpolated values flex-order-gt-sm="{{index}}"', function() {
      var scope = pageScope,
        element = $compile('<div flex-order-gt-sm="{{index}}">Layout</div>')(scope);

      scope.$apply('index = 3');
      expect(element.hasClass('flex-order-gt-sm-3')).toBeTruthy();
    });

    testAllSuffixesWithValues("flex-order", flexOrderValues);
  });

  describe('using [flex-offset] attributes', function() {
    var offsetValues = [
      5, 10, 15, 20, 25,
      30, 35, 40, 45, 50,
      55, 60, 65, 70, 75,
      80, 85, 90, 95,
      33, 34, 66, 67
    ];

    it('should support attribute without value "<div flex-offset>"', function() {
      var element = $compile('<div flex-offset>Layout</div>')(pageScope);
      expect(element.hasClass("flex-offset-0")).toBeTruthy();
      expect(element.hasClass("flex-offset")).toBeFalsy();
    });

    it('should ignore invalid values non-numericals like flex-offset="humpty"', function() {
      var element = $compile('<div flex-offset="humpty">Layout</div>')(pageScope);
      expect(element.hasClass("flex-offset-0")).toBeTruthy();
      expect(element.hasClass('flex-offset-humpty')).toBeFalsy();
    });

    it('should support interpolated values flex-offset-gt-sm="{{padding}}"', function() {
      var scope = pageScope,
        element = $compile('<div flex-offset-gt-sm="{{padding}}">Layout</div>')(scope);

      scope.$apply('padding = 15');
      expect(element.hasClass('flex-offset-gt-sm-15')).toBeTruthy();
    });

    testAllSuffixesWithValues("flex-offset", offsetValues);
  });

  describe('using [layout-align] attributes', function() {
    var attrName = "layout-align";
    var alignmentValues = [
      "start start", "start center", "start end",
      "center stretch", "center start", "center center", "center end",
      "end stretch", "end center", "end start", "end end",
      "space-around stretch", "space-around start", "space-around center", "space-around end",
      "space-between stretch", "space-between start", "space-between center", "space-between end"
    ];

    it('should support attribute without value "<div layout-align>"', function() {
      var markup = $mdUtil.supplant('<div {0}>Layout</div>', [attrName]);
      var element = $compile(markup)(pageScope);

      expect(element.hasClass(attrName + "-start-stretch")).toBeTruthy();
      expect(element.hasClass(attrName)).toBeFalsy();
    });

    it('should ignore invalid values non-numericals like layout-align="humpty"', function() {
      var markup = $mdUtil.supplant('<div {0}="humpty">Layout</div>', [attrName]);
      var element = $compile(markup)(pageScope);

      expect(element.hasClass(attrName + "-start-stretch")).toBeTruthy();
      expect(element.hasClass(attrName + '-humpty')).toBeFalsy();
    });

    it('should support interpolated values layout-align-gt-sm="{{alignItems}}"', function() {
      var scope = pageScope,
        markup = $mdUtil.supplant('<div {0}-gt-sm="{{alignItems}}">Layout</div>', [attrName]),
        element = $compile(markup)(scope);

      scope.$apply('alignItems = "center center"');
      expect(element.hasClass(attrName + '-gt-sm-center-center')).toBeTruthy();
    });

    testAllSuffixesWithValues(attrName, alignmentValues);
  });

  describe('using [layout-] padding, fill, margin, wrap, and nowrap attributes', function() {
    var allowedAttrsNoValues = [
      "layout-padding",
      "layout-margin",
      "layout-fill",
      "layout-wrap",
      "layout-no-wrap",
      "layout-nowrap"
    ];

    angular.forEach(allowedAttrsNoValues, function(name) {
      testNoValueAllowed(name);
    })
  });

  describe('using [hide] attributes', function() {
    var attrName = "hide",
      breakpoints = [''].concat(suffixes);

    angular.forEach(breakpoints, function(suffix) {
      var className = suffix ? attrName + "-" + suffix : attrName;
      testNoValueAllowed(className);
    });

  });

  describe('using [show] attributes', function() {
    var attrName = "show",
      breakpoints = [''].concat(suffixes);

    angular.forEach(breakpoints, function(suffix) {
      var className = suffix ? attrName + "-" + suffix : attrName;
      testNoValueAllowed(className);
    });

  });

  // *****************************************************************
  // Internal Test methods for the angular.forEach( ) loops
  // *****************************************************************

  /**
   * For the specified attrName (e.g. flex) test all breakpoints
   * with all allowed values.
   */
  function testAllSuffixesWithValues(attrName, allowedValues) {
    var breakpoints = [''].concat(suffixes);

    angular.forEach(breakpoints, function(suffix) {
      angular.forEach(allowedValues, function(value) {
        var className = suffix ? attrName + "-" + suffix : attrName;
        testWithValue(className, value, attrName);
      });
    });
  }

  /**
   * Test other Layout directives (e.g. flex, flex-order, flex-offset)
   */
  function testWithValue(className, value, raw) {
    var title = 'should allow valid values `' + className + '=' + value + '`';

    it(title, function() {

      var expected = $mdUtil.supplant('{0}-{1}', [className, value ? String(value).replace(/\s+/g, "-") : value]);
      var markup = $mdUtil.supplant('<div {0}="{1}">Layout</div>', [className, value]);

      var element = $compile(markup)(pageScope);
      if ( !element.hasClass(expected) ) {
        expect(expected).toBe(element[0].classList[1]);
      }

      if (raw) {
        // Is the raw value also present?
        expect(element.hasClass(raw)).toBeFalsy();
      }

    });
  }

  /**
   * Layout directives do NOT support values nor breakpoint usages:
   *
   * - layout-margin,
   * - layout-padding,
   * - layout-fill,
   * - layout-wrap,
   * - layout-nowrap
   *
   */
  function testNoValueAllowed(attrName) {

    it('should support attribute without value "<div ' + attrName + '>"', function() {
      var markup = $mdUtil.supplant('<div {0}>Layout</div>', [attrName]);
      var element = $compile(markup)(pageScope);

      expect(element.hasClass(attrName)).toBeTruthy();
    });

    it('should ignore invalid values non-numericals like ' + attrName + '="humpty"', function() {
      var markup = $mdUtil.supplant('<div {0}="humpty">Layout</div>', [attrName]);
      var element = $compile(markup)(pageScope);

      expect(element.hasClass(attrName)).toBeTruthy();
      expect(element.hasClass(attrName + '-humpty')).toBeFalsy();
    });

    it('should ignore interpolated values ' + attrName + '="{{someVal}}"', function() {
      var markup = $mdUtil.supplant('<div {0}="{{someVal}}">Layout</div>', [attrName]),
        element = $compile(markup)(pageScope);

      pageScope.$apply('someVal = "30"');

      expect(element.hasClass(attrName)).toBeTruthy();
      expect(element.hasClass($mdUtil.supplant("{0}-30", [attrName]))).toBeFalsy();

    });
  }

});
