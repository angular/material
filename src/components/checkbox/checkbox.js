/**
 * @ngdoc module
 * @name material.components.checkbox
 * @description Checkbox module!
 */
angular.module('material.components.checkbox', [
  'material.core',
  'material.animations',
  'material.services.aria'
])
  .directive('mdCheckbox', [ 
    'inputDirective',
    '$mdInkRipple',
    '$mdAria',
    '$mdConstant',
    MdCheckboxDirective
  ]);

/**
 * @ngdoc directive
 * @name mdCheckbox
 * @module material.components.checkbox
 * @restrict E
 *
 * @description
 * The checkbox directive is used like the normal [angular checkbox](https://docs.angularjs.org/api/ng/input/input%5Bcheckbox%5D).
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} name Property name of the form under which the control is published.
 * @param {expression=} ngTrueValue The value to which the expression should be set when selected.
 * @param {expression=} ngFalseValue The value to which the expression should be set when not selected.
 * @param {string=} ngChange Angular expression to be executed when input changes due to user interaction with the input element.
 * @param {boolean=} noink Use of attribute indicates use of ripple ink effects
 * @param {boolean=} disabled Use of attribute indicates the switch is disabled: no ink effects and not selectable
 * @param {string=} ariaLabel Publish the button label used by screen-readers for accessibility. Defaults to the checkbox's text.
 *
 * @usage
 * <hljs lang="html">
 * <md-checkbox ng-model="isChecked" aria-label="Finished?">
 *   Finished ?
 * </md-checkbox>
 *
 * <md-checkbox noink ng-model="hasInk" aria-label="No Ink Effects">
 *   No Ink Effects
 * </md-checkbox>
 *
 * <md-checkbox disabled ng-model="isDisabled" aria-label="Disabled">
 *   Disabled
 * </md-checkbox>
 *
 * </hljs>
 *
 */
function MdCheckboxDirective(inputDirectives, $mdInkRipple, $mdAria, $mdConstant) {
  var inputDirective = inputDirectives[0];

  var CHECKED_CSS = 'md-checked';

  return {
    restrict: 'E',
    transclude: true,
    require: '?ngModel',
    template: 
      '<div class="md-container" ink-ripple="checkbox">' +
        '<div class="md-icon"></div>' +
      '</div>' +
      '<div ng-transclude class="md-label"></div>',
    compile: compile
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function compile (tElement, tAttrs) {

    tAttrs.type = 'checkbox';
    tAttrs.tabIndex = 0;
    tElement.attr('role', tAttrs.type);

    return function postLink(scope, element, attr, ngModelCtrl) {
      var checked = false;

      // Create a mock ngModel if the user doesn't provide one
      ngModelCtrl = ngModelCtrl || {
        $setViewValue: function(value) {
          this.$viewValue = value;
        },
        $parsers: [],
        $formatters: []
      };

      $mdAria.expect(tElement, 'aria-label', true);

      // Reuse the original input[type=checkbox] directive from Angular core.
      // This is a bit hacky as we need our own event listener and own render
      // function.
      inputDirective.link.pre(scope, {
        on: angular.noop,
        0: {}
      }, attr, [ngModelCtrl]);

      element.on('click', listener);
      element.on('keypress', keypressHandler);
      ngModelCtrl.$render = render;

      function keypressHandler(ev) {
        if(ev.which === $mdConstant.KEY_CODE.SPACE) {
          ev.preventDefault();
          listener(ev);
        }
      }
      function listener(ev) {
        if (element[0].hasAttribute('disabled')) return;

        scope.$apply(function() {
          checked = !checked;
          ngModelCtrl.$setViewValue(checked, ev && ev.type);
          ngModelCtrl.$render();
        });
      }

      function render() {
        checked = ngModelCtrl.$viewValue;
        if(checked) {
          element.addClass(CHECKED_CSS);
        } else {
          element.removeClass(CHECKED_CSS);
        }
      }
    };
  }
}


