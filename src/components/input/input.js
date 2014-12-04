angular.module('material.components.input', [])

.directive('mdInputTwo', InputDirective);

function InputDirective($compile, $injector) {
  var PRIORITY = 49;
  var copyableAttributes = {};

  return {
    priority: PRIORITY,
    compile: compile,
    terminal: true
  };

  function compile(element, attr) {
    var label = angular.element('<label>').append(element.contents());
    var input = angular.element(angular.isDefined(attr.mdMultiline) ? '<textarea>' : '<input>');

    // Copy relevant attributes down to the input element: attrs that either aren't a directive,
    // or are a directive that has already run (a directive with higher priority)
    // For example, ng-if would NOT be copied down to the input because it has a higher priority
    angular.forEach(element[0].attributes, function(data) {
      var attrName = data.name;
      var attrValue = data.value;
      
      // Cache the test of whether this attribute should be copied, so it only has to
      // be run once.
      if (!copyableAttributes.hasOwnProperty(attrName)) {
        copyableAttributes[attrName] = !attrIsHigherPriority(attrName);
      }

      if (copyableAttributes[attrName]) {
        input[0].setAttribute(attrName, attrValue);
      }
    });

    function attrIsHigherPriority(attrName) {
      var injectName = attr.$normalize(attrName) + 'Directive';
      var directives = $injector.has(injectName) ? $injector.get(injectName) : [];

      return directives.every(function(dir) {
        return dir.priority > PRIORITY;
      });
    }

    element.append(label).append(input);

    return postLink;
  }

  function postLink(scope, element, attr) {
    $compile(element.contents())(scope);

    // Make sure we aren't selecting an input the user might have put inside the label
    var input = angular.element(element[0].querySelector(
      (angular.isDefined(attr.mdMultiline) ? 'textarea' : 'input') + ':last-of-type'
    ));
    var ngModelCtrl = input.data('$ngModelController');

    ngModelCtrl && setupFloatingLabel();

    //*********
    // Methods 
    //*********

    function setupFloatingLabel() {
      scope.$watch(function() {
        return ngModelCtrl.$isEmpty(ngModelCtrl.$viewValue);
      }, function isEmptyWatch(value) {
        element.toggleClass('md-input-has-value', !value);
      });

      input.on('focus', function() {
        element.addClass('md-input-focused');
      });
      input.on('blur', function() {
        element.removeClass('md-input-focused');
      });
    }
  }
}
