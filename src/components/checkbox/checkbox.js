/**
 * @ngdoc module
 * @name material.components.checkbox
 * @description Checkbox module!
 */
angular.module('material.components.checkbox', [
  'material.animations'
])
  .directive('materialCheckbox', [
    materialCheckboxDirective
  ]);

/**
 * @ngdoc directive
 * @name materialCheckbox
 * @module material.components.checkbox
 * @restrict E
 *
 * @description
 * Checkbox directive!
 *
 * @param {expression=} ngModel An expression to bind this checkbox to.
 */
function materialCheckboxDirective() {

  var CHECKED_CSS = 'material-checked';

  return {
    restrict: 'E',
    scope: true,
    transclude: true,
    template: '<div class="material-container">' +
                '<material-ripple start="center" class="circle" material-checked="{{ checked }}" ></material-ripple>' +
                '<div class="material-icon"></div>' +
              '</div>' +
              '<div ng-transclude class="material-label"></div>',
    link: link
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function link(scope, element, attr) {
    var input = element.find('input');
    var ngModelCtrl = angular.element(input).controller('ngModel');
    scope.checked = false;

    if(!ngModelCtrl || input[0].type !== 'checkbox') return;

    // watch the ng-model $viewValue
    scope.$watch(
      function () { return ngModelCtrl.$viewValue; },
      function () {
        scope.checked = input[0].checked;

        element.attr('aria-checked', scope.checked);
        if(scope.checked) {
          element.addClass(CHECKED_CSS);
        } else {
          element.removeClass(CHECKED_CSS);
        }
      }
    );

    // add click listener to directive element to manually
    // check the inner input[checkbox] and set $viewValue
    var listener = function(ev) {
      scope.$apply(function() {
        input[0].checked = !input[0].checked;
        ngModelCtrl.$setViewValue(input[0].checked, ev && ev.type);
      });
    };
    element.on('click', listener);

  }

}


