/**
 * @ngdoc module
 * @name material.components.checkbox
 * @description Checkbox module!
 */
angular.module('material.components.checkbox', [
  'material.animations',
  'material.services.aria'
])
  .directive('materialCheckbox', [ 
    'inputDirective',
    '$materialInkRipple',
    '$aria',
    MaterialCheckboxDirective
  ]);

/**
 * @ngdoc directive
 * @name materialCheckbox
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
 * <material-checkbox ng-model="isChecked" aria-label="Finished?">
 *   Finished ?
 * </material-checkbox>
 *
 * <material-checkbox noink ng-model="hasInk" aria-label="No Ink Effects">
 *   No Ink Effects
 * </material-checkbox>
 *
 * <material-checkbox disabled ng-model="isDisabled" aria-label="Disabled">
 *   Disabled
 * </material-checkbox>
 *
 * </hljs>
 *
 */
function MaterialCheckboxDirective(inputDirectives, $materialInkRipple, $aria) {
  var inputDirective = inputDirectives[0];

  var CHECKED_CSS = 'material-checked';

  return {
    restrict: 'E',
    transclude: true,
    require: '?ngModel',
    template: 
      '<div class="material-container" ink-ripple="checkbox">' +
        '<div class="material-icon"></div>' +
      '</div>' +
      '<div ng-transclude class="material-label"></div>',
    link: postLink
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function postLink(scope, element, attr, ngModelCtrl) {
    var checked = false;

    // Create a mock ngModel if the user doesn't provide one
    ngModelCtrl = ngModelCtrl || {
      $setViewValue: function(value) {
        this.$viewValue = value;
      },
      $parsers: [],
      $formatters: []
    };

    // Reuse the original input[type=checkbox] directive from Angular core.
    // This is a bit hacky as we need our own event listener and own render 
    // function.
    attr.type = 'checkbox';
    attr.tabIndex = 0;
    inputDirective.link(scope, {
      on: angular.noop,
      0: {}
    }, attr, [ngModelCtrl]);

    // We can't chain element.attr here because of a bug with jqLite
    element.attr('aria-checked', checked);
    element.attr('role', attr.type);
    element.attr('tabIndex', attr.tabIndex);
    element.on('click', listener);
    element.on('keypress', keypressHandler);
    ngModelCtrl.$render = render;

    $aria.expect(element, 'aria-label', element.text());

    function keypressHandler(ev) {
      if(ev.which === Constant.KEY_CODE.SPACE) {
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
      element.attr('aria-checked', checked);
      if(checked) {
        element.addClass(CHECKED_CSS);
      } else {
        element.removeClass(CHECKED_CSS);
      }
    }
  }

}


