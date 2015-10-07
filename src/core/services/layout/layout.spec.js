describe('layout directives', function() {
  beforeEach(module('material.core', 'material.core.layout'));

  describe('translated to layout classes', function() {

    var suffixes = ['sm', 'gt-sm', 'md', 'gt-md', 'lg', 'gt-lg'];
    var directionValues = ['row', 'column'];
    var flexOrderValues = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var flexValues = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 33, 34, 66, 67];
    var offsetValues = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 33, 34, 66, 67];
    var alignmentValues = [
      "center", "center center", "center start", "center end",
      "end", "end center", "end start", "end end",
      "space-around", "space-around center", "space-around start", "space-around end",
      "space-between", "space-between center", "space-between start", "space-between end",
      "start center", "start start", "start end"];
    var mappings = [
      { attribute: 'flex',           suffixes: suffixes, values: flexValues, testStandAlone: true},
      { attribute: 'flex-order',     suffixes: suffixes, values: flexOrderValues },
      { attribute: 'offset',         suffixes: suffixes, values: offsetValues },
      { attribute: 'hide',           suffixes: suffixes, testStandAlone: true },
      { attribute: 'show',           suffixes: suffixes, testStandAlone: true },
      { attribute: 'layout-align',   suffixes: suffixes, values: alignmentValues },
      { attribute: 'layout-padding', testStandAlone: true },
      { attribute: 'layout-margin',  testStandAlone: true },
      { attribute: 'layout-wrap',    testStandAlone: true },
      { attribute: 'layout-fill',    testStandAlone: true }
    ];

    // Run all the tests; iterating the mappings...
    testWithSuffix('layout', suffixes, directionValues);

    for (var i = 0; i < mappings.length; i++) {
      var map = mappings[i];

      if (map.testStandAlone) testSimpleDirective(map.attribute);
      if (map.values)         testWithSuffixAndValue(map.attribute, map.values, undefined );
      if (map.suffixes)       testWithSuffix(map.attribute, map.suffixes, map.values, map.testStandAlone );
    }


    /** Test a simple layout directive to validate that the layout class is added. */
    function testSimpleDirective(attribute, expectedClass) {
      // default fallback is attribute as class...
      expectedClass = expectedClass || attribute;

      it('should fail if the class ' + expectedClass + ' was not added for attribute ' + attribute, inject(function($compile, $rootScope) {
        var element = $compile('<div ' + attribute + '>Layout</div>')($rootScope.$new());
        expect(element.hasClass(expectedClass)).toBe(true);
      }));
    }

    /** Test directives with 'sm', 'gt-sm', 'md', 'gt-md', 'lg', and 'gt-lg' suffixes */
    function testWithSuffixAndValue(attribute, values, suffix) {
      for (var j = 0; j < values.length; j++) {
        var value = values[j].toString();
        var attr = suffix ? attribute + '-' + suffix : attribute;

        var attrWithValue = buildAttributeWithValue(attr, value);
        var expectedClass = buildExpectedClass(attr, value);

        // Run each test.
        testSimpleDirective(attrWithValue, expectedClass);
      }

      /**
       * Build string of expected classes that should be added to the DOM element.
       *
       * Convert directive with value to classes
       *
       * @param {string} attrClass Full attribute name; eg 'layout-gt-lg'
       * @param {string} attrValue HTML directive; eg "column"
       *
       * @returns {string} Class name(s) to be added; e.g., `layout-gt-lg-column`.
       */
      function buildExpectedClass(attrClass, attrValue) {

        // Layout attributes have special md-layout prefix class names
        angular.forEach([''].concat(suffixes), function(it){
          var layout = (it ? "layout-" : "layout") + it;
          if (attrClass == layout) attrClass = "md-" + attrClass;
        });

        return attrClass + "-" + attrValue.replace(/\s+/g, "-");
      }

      /**
       * Build full string of expected directive with its value
       * Note: The expected class always starts with the
       *     attribute name, add the suffix if any.
       *
       * @param {string} attrClass Full attribute name; eg 'layout-gt-lg'
       * @param {string} attrValue HTML directive; eg "column"
       *
       * @returns {string} Attribute with value, e.g., `layout-gt-lg="column"`
       */
      function buildAttributeWithValue(attrClass, attrValue) {
        return attrClass + '="' + attrValue + '"';
      }
    }

    /**
     * Test directive as simple with media suffix and with associated values.
     * E.g., layout-gt-md="row"
     */
    function testWithSuffix(attribute, suffixes, values, testStandAlone) {
      for (var j = 0; j < suffixes.length; j++) {
        var suffix = suffixes[j];
        var attr = attribute + '-' + suffix;

        if (testStandAlone) testSimpleDirective(attr);
        if (values) testWithSuffixAndValue(attribute, values, suffix);
      }
    }
  });

  describe('layout attribute with dynamic values', function() {

    it('should observe the attribute value and update the layout class(es)', inject(function($rootScope, $compile) {
      var scope = $rootScope.$new();
          scope.size = undefined;

      var element = angular.element($compile('<div flex-gt-md="{{size}}"></div>')(scope));

      expect(element.hasClass('flex-gt-md')).toBe(true);
      expect(element.hasClass('flex-gt-md-size')).toBe(false);

      scope.$apply(function() {
        scope.size = 32;
      });

      expect(element.hasClass('flex-gt-md-32')).toBe(true);

      scope.$apply(function() {
        scope.size = "fishCheeks";
      });

      expect(element.hasClass('flex-gt-md-32')).toBe(false);
      expect(element.hasClass('flex-gt-md-fishCheeks')).toBe(true);

    }));

  })
});
