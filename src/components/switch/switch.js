/**
 * @ngdoc module
 * @name material.components.switch
 */

angular.module('material.components.switch', [
  'material.components.checkbox',
  'material.components.radioButton'
])

.directive('materialSwitch', [
  'materialCheckboxDirective',
  'materialRadioButtonDirective',
  MaterialSwitch
]);

/**
 * @ngdoc directive
 * @module material.components.switch
 * @name materialSwitch
 * @restrict E
 *
 * The switch directive is used very much like the normal [angular checkbox](https://docs.angularjs.org/api/ng/input/input%5Bcheckbox%5D).
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} name Property name of the form under which the control is published.
 * @param {expression=} ngTrueValue The value to which the expression should be set when selected.
 * @param {expression=} ngFalseValue The value to which the expression should be set when not selected.
 * @param {string=} ngChange Angular expression to be executed when input changes due to user interaction with the input element.
 * @param {boolean=} noink Use of attribute indicates use of ripple ink effects.
 * @param {boolean=} disabled Use of attribute indicates the switch is disabled: no ink effects and not selectable
 * @param {string=} ariaLabel Publish the button label used by screen-readers for accessibility. Defaults to the switch's text.
 *
 * @usage
 * <hljs lang="html">
 * <material-switch ng-model="isActive" aria-label="Finished?">
 *   Finished ?
 * </material-switch>
 *
 * <material-switch noink ng-model="hasInk" aria-label="No Ink Effects">
 *   No Ink Effects
 * </material-switch>
 *
 * <material-switch disabled ng-model="isDisabled" aria-label="Disabled">
 *   Disabled
 * </material-switch>
 *
 * </hljs>
 */
function MaterialSwitch(checkboxDirectives, radioButtonDirectives) {
  var checkboxDirective = checkboxDirectives[0];
  var radioButtonDirective = radioButtonDirectives[0];

  return {
    restrict: 'E',
    transclude: true,
    template:
      '<div class="material-switch-bar"></div>' +
      '<div class="material-switch-thumb">' +
        radioButtonDirective.template +
      '</div>',
    require: '?ngModel',
    compile: compile
  };

  function compile(element, attr) {
    
    var thumb = angular.element(element[0].querySelector('.material-switch-thumb'));
    //Copy down disabled attributes for checkboxDirective to use
    thumb.attr('disabled', attr.disabled);
    thumb.attr('ngDisabled', attr.ngDisabled);

    return function postLink(scope, element, attr, ngModelCtrl) {
      checkboxDirective.link(scope, thumb, attr, ngModelCtrl);
    };
  }
}
