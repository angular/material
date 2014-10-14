/**
 * @private
 * @ngdoc module
 * @name material.components.switch
 */

angular.module('material.components.switch', [
  'material.components.checkbox',
  'material.components.radioButton'
])

.directive('mdSwitch', [
  'mdCheckboxDirective',
  'mdRadioButtonDirective',
  MdSwitch
]);

/**
 * @private
 * @ngdoc directive
 * @module material.components.switch
 * @name mdSwitch
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
 * <md-switch ng-model="isActive" aria-label="Finished?">
 *   Finished ?
 * </md-switch>
 *
 * <md-switch noink ng-model="hasInk" aria-label="No Ink Effects">
 *   No Ink Effects
 * </md-switch>
 *
 * <md-switch disabled ng-model="isDisabled" aria-label="Disabled">
 *   Disabled
 * </md-switch>
 *
 * </hljs>
 */
function MdSwitch(checkboxDirectives, radioButtonDirectives) {
  var checkboxDirective = checkboxDirectives[0];
  var radioButtonDirective = radioButtonDirectives[0];

  return {
    restrict: 'E',
    transclude: true,
    template:
      '<div class="md-switch-bar"></div>' +
      '<div class="md-switch-thumb">' +
        radioButtonDirective.template +
      '</div>',
    require: '?ngModel',
    compile: compile
  };

  function compile(element, attr) {
    
    var thumb = angular.element(element[0].querySelector('.md-switch-thumb'));
    //Copy down disabled attributes for checkboxDirective to use
    thumb.attr('disabled', attr.disabled);
    thumb.attr('ngDisabled', attr.ngDisabled);

    var link = checkboxDirective.compile(thumb, attr);

    return function (scope, element, attr, ngModelCtrl) {
      var thumb = angular.element(element[0].querySelector('.md-switch-thumb'));
      return link(scope, thumb, attr, ngModelCtrl)
    };
  }
}
