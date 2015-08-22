describe('layouts service', function () {
    beforeEach(module('material.layouts'));

    describe('expecting layout classes', function () {

        var suffixes = ['sm', 'gt-sm', 'md', 'gt-md', 'lg', 'gt-lg'];

        var directionValues = ['row', 'column'];
        var flexValues = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 33, 34, 66, 67];
        var alignmentValues = ['center', 'center center', 'center start', 'center end',
                           'end', 'end-center', 'end start', 'end end',
                           'space-around', 'space-around center', 'space-around start', 'space-around end',
                           'space-between', 'space-between center', 'space-between start', 'space-between end',
                           'center center', 'start center', 'end center', 'space-between center', 'space-around center',
                           'center start', 'start start', 'end start', 'space-between start', 'space-around start',
                           'center end', 'start end', 'end end', 'space-between end', 'space-around end'];
        var flexOrderValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        var offsetValues = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 33, 34, 66, 67];

        var mappings = [{ attribute: 'layout', suffixes: suffixes, values: directionValues, testStandAlone: true, addDirectiveAsClass: true },
                        { attribute: 'flex', suffixes: suffixes, values: flexValues, testStandAlone: true, addDirectiveAsClass: true },
                        { attribute: 'layout-align', suffixes: suffixes, values: alignmentValues },
                        { attribute: 'flex-order', suffixes: suffixes, values: flexOrderValues },
                        { attribute: 'offset', suffixes: suffixes, values: offsetValues },
                        { attribute: 'layout-padding', testStandAlone: true },
                        { attribute: 'layout-margin', testStandAlone: true },
                        { attribute: 'layout-wrap', testStandAlone: true },
                        { attribute: 'layout-fill', testStandAlone: true },
                        { attribute: 'hide', suffixes: suffixes, testStandAlone: true },
                        { attribute: 'show', suffixes: suffixes, testStandAlone: true }];

        function testMapping(attribute, expectedClass) {
            it('should fail if the class ' + expectedClass + ' was not added for attribute ' + attribute, inject(function ($compile, $rootScope) {
                var element = $compile('<div ' + attribute + '>Layout</div>')($rootScope);
                expect(element.hasClass(expectedClass)).toBe(true);
            }));
        }

        function testWithSuffix(attribute, suffixes, values, testStandAlone, addDirectiveAsClass) {
            for (var j = 0; j < suffixes.length; j++) {
                var suffix = suffixes[j];
                // Add the suffix to the attribute.
                var attributeWithValue = attribute + '-' + suffix;
                // Add the suffix to the expected class.
                var expectedClass = attribute + '-' + suffix;
                // Run the test.
                if (testStandAlone)
                    testMapping(attributeWithValue, expectedClass);
                // Add suffixes with values.
                if (values)
                    testWithSuffixAndValue(attribute, values, suffix, addDirectiveAsClass);
            };
        }

        function testWithSuffixAndValue(attribute, values, suffix, addDirectiveAsClass) {
            for (var j = 0; j < values.length; j++) {
                var attributeValue = values[j].toString();
                // If there was a suffix passed in, add it first.
                var attributeWithValue = suffix ? attribute + '-' + suffix : attribute;
                // Add the value.
                attributeWithValue += '="' + attributeValue + '"';
                // The expected class always starts with the attribute name, add the suffix if any.
                var expectedClass = suffix ? attribute + '-' + suffix : attribute;
                // Add the class if necessary.
                if (addDirectiveAsClass)
                    expectedClass += ' ' + expectedClass;
                // Add the attribute and suffix to the expected class and replace the spaces with a dash.                
                expectedClass += '-' + attributeValue.replace(/\s+/g, "-");
                // Run the test.
                testMapping(attributeWithValue, expectedClass);
            };
        }

        for (var i = 0; i < mappings.length; i++) {
            var mapping = mappings[i];
            // First test the mapping without any suffixes or values.
            if (mapping.testStandAlone)
                testMapping(mapping.attribute, mapping.attribute);
            // Check for suffixes.
            if (mapping.suffixes)
                testWithSuffix(mapping.attribute, mapping.suffixes, mapping.values, mapping.testStandAlone, mapping.addDirectiveAsClass);
            // Check for values.
            if (mapping.values)
                testWithSuffixAndValue(mapping.attribute, mapping.values, undefined, mapping.addDirectiveAsClass);
        }
    });
});
