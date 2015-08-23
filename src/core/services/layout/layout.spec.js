describe('layout directives', function() {

  beforeEach(module('material.core'));

  describe('expecting layout classes', function() {

    var suffixes = ['sm', 'gt-sm', 'md', 'gt-md', 'lg', 'gt-lg'];
    var directionValues = ['row', 'column'];
    var flexOrderValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var flexValues = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 33, 34, 66, 67];
    var offsetValues = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 33, 34, 66, 67];
    var alignmentValues = [
          'center', 'center center', 'center start', 'center end',
          'end', 'end-center', 'end start', 'end end',
          'space-around', 'space-around center', 'space-around start', 'space-around end',
          'space-between', 'space-between center', 'space-between start', 'space-between end',
          'center center', 'start center', 'end center', 'space-between center', 'space-around center',
          'center start', 'start start', 'end start', 'space-between start', 'space-around start',
          'center end', 'start end', 'end end', 'space-between end', 'space-around end'
        ];
    var mappings = [
            { attribute: 'flex',           suffixes: suffixes, values: flexValues, addDirectiveAsClass: true, testStandAlone: true},
            { attribute: 'flex-order',     suffixes: suffixes, values: flexOrderValues },
            { attribute: 'offset',         suffixes: suffixes, values: offsetValues },
            { attribute: 'hide',           suffixes: suffixes, testStandAlone: true },
            { attribute: 'show',           suffixes: suffixes, testStandAlone: true },
            { attribute: 'layout',         suffixes: suffixes, values: directionValues, addDirectiveAsClass: true, testStandAlone: true },
            { attribute: 'layout-align',   suffixes: suffixes, values: alignmentValues },
            { attribute: 'layout-padding', testStandAlone: true },
            { attribute: 'layout-margin',  testStandAlone: true },
            { attribute: 'layout-wrap',    testStandAlone: true },
            { attribute: 'layout-fill',    testStandAlone: true }
        ];

    // Run all the tests; iterating the mappings...

    for (var i = 0; i < mappings.length; i++) {
      var map = mappings[i];

      if (map.testStandAlone) testSimpleDirective(map.attribute);
      if (map.values)         testWithSuffixAndValue(map.attribute, map.values, undefined, map.addDirectiveAsClass);
      if (map.suffixes)       testWithSuffix(map.attribute, map.suffixes, map.values, map.testStandAlone, map.addDirectiveAsClass);
    }

    /**
     * Test a simple layout directive to validate that the layout class is added.
     */
    function testSimpleDirective(attribute, expectedClass) {
      // default fallback is attribute as class...
      expectedClass = expectedClass || attribute;

      it('should fail if the class ' + expectedClass + ' was not added for attribute ' + attribute, inject(function($compile, $rootScope) {
        var element = $compile('<div ' + attribute + '>Layout</div>')($rootScope);
        expect(element.hasClass(expectedClass)).toBe(true);
      }));
    }

    /**
     * Test directives with 'sm', 'gt-sm', 'md', 'gt-md', 'lg', and 'gt-lg' suffixes
     */
    function testWithSuffixAndValue(attribute, values, suffix, addDirectiveAsClass) {

      for (var j = 0; j < values.length; j++) {
        var value = values[j].toString();
        var attr = suffix ? attribute + '-' + suffix : attribute;

        var attrWithValue = buildAttributeWithValue(attr, value);
        var expectedClass = buildExpectedClass(attr, value);

        // Run each test.
        testSimpleDirective(attrWithValue, expectedClass);
      }

      /**
       * Build string of expected classes that should be added to the
       * DOM element.
       *
       * Convert directive with value to classes
       *
       * @param attrClass String full attribute name; eg 'layout-gt-lg'
       * @param attrValue String HTML directive; eg "column"
       *
       * @returns String to be used with element.addClass(...); eg  `layout-gt-lg layout-gt-lg-column`
       */
      function buildExpectedClass(attrClass, attrValue) {
        if (addDirectiveAsClass) attrClass += ' ' + attrClass;
        return attrClass + "-" + attrValue.replace(/\s+/g, "-");
      }

      /**
       * Build full string of expected directive with its value
       * Note: The expected class always starts with the
       *     attribute name, add the suffix if any.
       *
       * @param attrClass String full attribute name; eg 'layout-gt-lg'
       * @param attrValue String HTML directive; eg "column"
       *
       * @returns String like `layout-gt-lg="column"`
       */
      function buildAttributeWithValue(attr, value) {
        return attr + '="' + value + '"';
      }
    }

    /**
     * Test directive as simple with media suffix and with associated values.
     * e.g.  layout-gt-md="row"
     */
    function testWithSuffix(attribute, suffixes, values, testStandAlone, addDirectiveAsClass) {
      for (var j = 0; j < suffixes.length; j++) {
        var suffix = suffixes[j];
        var attr = attribute + '-' + suffix;

        if (testStandAlone) testSimpleDirective(attr);
        if (values) testWithSuffixAndValue(attribute, values, suffix, addDirectiveAsClass);
      }
    }
  });

});
