describe('layout directives', function() {
  var suffixes = ['sm', 'gt-sm', 'md', 'gt-md', 'lg', 'gt-lg'];

  beforeEach(module('material.core', 'material.core.layout'));

  describe('using [layout] attributes', function() {

    it("should support attribute without value '<div layout>'", inject(function($compile, $rootScope) {
      var element = $compile('<div layout>Layout</div>')($rootScope.$new());
      expect(element.hasClass("layout")).toBeFalsy();
      expect(element.hasClass("layout-row")).toBeTruthy();
    }));

    it('should ignore invalid values', inject(function($compile, $rootScope) {
      var element = $compile('<div layout="humpty">Layout</div>')($rootScope.$new());
      expect(element.hasClass("layout-row")).toBeTruthy();
      expect(element.hasClass('layout-humpty')).toBeFalsy();
    }));

    it('should support interpolated values layout-gt-sm="{{direction}}"', inject(function($compile, $rootScope) {
      var scope = $rootScope.$new(),
        element = $compile('<div layout-gt-sm="{{direction}}">Layout</div>')(scope);

      scope.$apply('direction = "row"');
      expect(element.hasClass('layout-gt-sm-row')).toBeTruthy();

      scope.$apply('direction = undefined');
      expect(element.hasClass('layout-gt-sm-row')).toBeTruthy();

      scope.$apply('direction = "column"');
      expect(element.hasClass('layout-gt-sm-column')).toBeTruthy();
    }));

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

    it('should support attribute without value "<div flex>"', inject(function($compile, $rootScope) {
      var element = $compile('<div flex>Layout</div>')($rootScope.$new());
      expect(element.hasClass("flex")).toBeTruthy();
      expect(element.hasClass("flex-flex")).toBeFalsy();
    }));

    it('should ignore invalid values non-numericals like flex="flex"', inject(function($compile, $rootScope) {
      var element = $compile('<div flex="flex">Layout</div>')($rootScope.$new());
      expect(element.hasClass("flex")).toBeTruthy();
      expect(element.hasClass('flex-flex')).toBeFalsy();
    }));

    it('should support interpolated values flex-gt-sm="{{columnSize}}"', inject(function($compile, $rootScope) {
      var scope = $rootScope.$new(),
        element = $compile('<div flex-gt-sm="{{columnSize}}">Layout</div>')(scope);

      scope.$apply('columnSize = 33');
      expect(element.hasClass('flex-gt-sm-33')).toBeTruthy();

      scope.$apply('columnSize = undefined');
      expect(element.hasClass('flex-gt-sm')).toBeTruthy();

    }));

    it('should observe the attribute value and update the layout class(es)', inject(function($rootScope, $compile) {
      var scope = $rootScope.$new();
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

    testAllSufficesWithValues("flex", allowedValues );

  });
  describe('using [flex-order] attributes', function() {
    var flexOrderValues = [
      -9, -8, -7, -6, -5, -4, -3, -2, -1,
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9
    ];

    it('should support attribute without value "<div flex-order>"', inject(function($compile, $rootScope) {
      var element = $compile('<div flex-order>Layout</div>')($rootScope.$new());
      expect(element.hasClass("flex-order-0")).toBeTruthy();
      expect(element.hasClass("flex-order")).toBeFalsy();
    }));

    it('should ignore invalid values non-numericals like flex-order="humpty"', inject(function($compile, $rootScope) {
      var element = $compile('<div flex-order="humpty">Layout</div>')($rootScope.$new());
      expect(element.hasClass("flex-order-0")).toBeTruthy();
      expect(element.hasClass('flex-order-humpty')).toBeFalsy();
    }));

    it('should support interpolated values flex-order-gt-sm="{{index}}"', inject(function($compile, $rootScope) {
      var scope = $rootScope.$new(),
        element = $compile('<div flex-order-gt-sm="{{index}}">Layout</div>')(scope);

      scope.$apply('index = 3');
      expect(element.hasClass('flex-order-gt-sm-3')).toBeTruthy();

    }));

    testAllSufficesWithValues("flex-order", flexOrderValues );

  });
  describe('using [layout-offset] attributes', function() {
    var offsetValues = [
      5, 10, 15, 20, 25,
      30, 35, 40, 45, 50,
      55, 60, 65, 70, 75,
      80, 85, 90, 95,
      33, 34, 66, 67
    ];

    it('should support attribute without value "<div layout-offset>"', inject(function($compile, $rootScope) {
      var element = $compile('<div layout-offset>Layout</div>')($rootScope.$new());
      expect(element.hasClass("layout-offset-0")).toBeTruthy();
      expect(element.hasClass("layout-offset")).toBeFalsy();
    }));

    it('should ignore invalid values non-numericals like layout-offset="humpty"', inject(function($compile, $rootScope) {
      var element = $compile('<div layout-offset="humpty">Layout</div>')($rootScope.$new());
      expect(element.hasClass("layout-offset-0")).toBeTruthy();
      expect(element.hasClass('layout-offset-humpty')).toBeFalsy();
    }));

    it('should support interpolated values layout-offset-gt-sm="{{padding}}"', inject(function($compile, $rootScope) {
      var scope = $rootScope.$new(),
        element = $compile('<div layout-offset-gt-sm="{{padding}}">Layout</div>')(scope);

      scope.$apply('padding = 15');
      expect(element.hasClass('layout-offset-gt-sm-15')).toBeTruthy();
    }));

    testAllSufficesWithValues("layout-offset", offsetValues );

  });
  describe('using [layout-align] attributes', function() {
    var attrName = "layout-align";
    var alignmentValues = [
      "center", "center center", "center start", "center end",
      "end", "end center", "end start", "end end",
      "space-around", "space-around center", "space-around start", "space-around end",
      "space-between", "space-between center", "space-between start", "space-between end",
      "start center", "start start", "start end"
    ];

    it('should support attribute without value "<div layout-align>"', inject(function($compile, $rootScope, $mdUtil) {
      var markup = $mdUtil.supplant('<div {0}>Layout</div>', [attrName]);
      var element = $compile(markup)($rootScope.$new());

      expect(element.hasClass(attrName + "-start-start")).toBeTruthy();
      expect(element.hasClass(attrName)).toBeFalsy();
    }));

    it('should ignore invalid values non-numericals like layout-align="humpty"', inject(function($compile, $rootScope, $mdUtil) {
      var markup = $mdUtil.supplant('<div {0}="humpty">Layout</div>', [attrName]);
      var element = $compile(markup)($rootScope.$new());

      expect(element.hasClass(attrName + "-start-start")).toBeTruthy();
      expect(element.hasClass(attrName + '-humpty')).toBeFalsy();
    }));

    it('should support interpolated values layout-align-gt-sm="{{alignItems}}"', inject(function($compile, $rootScope, $mdUtil) {
      var scope = $rootScope.$new(),
        markup = $mdUtil.supplant('<div {0}-gt-sm="{{alignItems}}">Layout</div>', [attrName]),
        element = $compile(markup)(scope);

      scope.$apply('alignItems = "center center"');
      expect(element.hasClass(attrName + '-gt-sm-center-center')).toBeTruthy();
    }));

    testAllSufficesWithValues(attrName, alignmentValues );


  });
  describe('using [layout-] padding, fill, margin, wrap, and nowrap attributes', function() {
    var allowedAttrsNoValues = [
      "layout-padding",
      "layout-margin",
      "layout-fill",
      "layout-wrap",
      "layout-no-wrap"
    ];

    angular.forEach(allowedAttrsNoValues,function(name){
      testNoValueAllowed(name);
    })
  });
  describe('using [hide] attributes', function() {
    var attrName = "hide",
        breakpoints = [''].concat(suffixes);

    angular.forEach(breakpoints, function(suffix) {
      var className = suffix ? attrName + "-" + suffix : attrName;
      testNoValueAllowed( className );
    });

  });
  describe('using [show] attributes', function() {
    var attrName = "show",
        breakpoints = [''].concat(suffixes);

    angular.forEach(breakpoints, function(suffix) {
      var className = suffix ? attrName + "-" + suffix : attrName;
      testNoValueAllowed( className );
    });

  });

  // *****************************************************************
  // Internal Test methods for the angular.forEach( ) loops
  // *****************************************************************

  /**
   * For the specified attrName (e.g. flex) test all breakpoints
   * with all allowed values.
   */
  function testAllSufficesWithValues(attrName, allowedValues) {
    var breakpoints = [''].concat(suffixes);

    angular.forEach(breakpoints, function(suffix) {
      angular.forEach(allowedValues, function(value) {
        var className = suffix ? attrName + "-" + suffix : attrName;
        testWithValue(className, value, attrName );
      });
    });

  }

  /**
   * Test other Layout directives (e.g. flex, flex-order, layout-offset)
   */
  function testWithValue(className, value, raw) {
    var title = 'should allow valid values `' + className + '=' + value + '`';

    it(title, inject(function($compile, $rootScope, $mdUtil) {

      var expected = $mdUtil.supplant('{0}-{1}',[className, value ? String(value).replace(/\s+/g, "-") : value]);
      var markup   = $mdUtil.supplant('<div {0}="{1}">Layout</div>',[className,value]);

      var element = $compile(markup)($rootScope.$new());
      expect(element.hasClass(expected)).toBeTruthy();

      if ( raw ) {
        // Is the raw value also present?
        expect(element.hasClass(raw)).toBeFalsy();
      }

    }));
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

        it('should support attribute without value "<div '+ attrName +'>"', inject(function($compile, $rootScope, $mdUtil) {
          var markup = $mdUtil.supplant('<div {0}>Layout</div>', [attrName]);
          var element = $compile(markup)($rootScope.$new());

          expect(element.hasClass(attrName)).toBeTruthy();
        }));

        it('should ignore invalid values non-numericals like '+ attrName +'="humpty"', inject(function($compile, $rootScope, $mdUtil) {
          var markup = $mdUtil.supplant('<div {0}="humpty">Layout</div>', [attrName]);
          var element = $compile(markup)($rootScope.$new());

          expect(element.hasClass(attrName)).toBeTruthy();
          expect(element.hasClass(attrName + '-humpty')).toBeFalsy();
        }));

        it('should ignore interpolated values '+ attrName +'="{{someVal}}"', inject(function($compile, $rootScope, $mdUtil) {
          var scope = $rootScope.$new(),
            markup = $mdUtil.supplant('<div {0}="{{someVal}}">Layout</div>', [attrName]),
            element = $compile(markup)(scope);

          scope.$apply('someVal = "30"');

          expect(element.hasClass(attrName)).toBeTruthy();
          expect(element.hasClass( $mdUtil.supplant("{0}-30",[attrName]) )).toBeFalsy();

        }));
      }



});
