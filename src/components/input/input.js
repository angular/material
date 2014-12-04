angular.module('material.components.input', [])

.directive('mdInputTwo', InputDirective);

function InputDirective($compile, $injector) {
  var PRIORITY = 99;
  var copyableAttributes = {};

  return {
    priority: PRIORITY,
    terminal: true,
    link: {
      pre: preLink,
      post: postLink
    }
  };

  function preLink(scope, element, attr) {
    var input = angular.element(angular.isDefined(attr.mdMultiline) ? '<textarea>' : '<input>');
    var node = element[0];

    // Copy relevant attributes down to the input element: attrs that either aren't a directive,
    // or are a directive that has already run (a directive with higher priority)
    // For example, ng-if would NOT be copied down to the input because it has a higher priority
    angular.forEach(node.attributes, function(data) {
      var attrName = data.name;
      var attrValue = data.value;
      
      if (!copyableAttributes.hasOwnProperty(attrName)) {
        copyableAttributes[attrName] = attrIsHigherPriority(attrName);
      }

      if (copyableAttributes[attrName]) {
        input[0].setAttribute(attrName, attrValue);
      }
    });

    function attrIsHigherPriority(attrName) {
      var injectName = attr.$normalize(attrName) + 'Directive';
      var directives = $injector.has(injectName) ? $injector.get(injectName) : [];

      for (var i = 0, ii = directives.length; i < ii; i++) {
        if (directives[i].priority > PRIORITY) {
          return false;
        }
      }
      return true;
    }
 
    var label = angular.element('<label>').append(element.contents());
    element.append(label);

    element.append(input);
    $compile(input)(scope);
  }

  function postLink(scope, element, attr) {
    var input = element.find(angular.isDefined(attr.mdMultiline) ? 'textarea' : 'input');
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
