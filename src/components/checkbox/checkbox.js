/**
 * @ngdoc module
 * @name material.components.checkbox
 * @description Checkbox module!
 */
angular
  .module('material.components.checkbox', ['material.core'])
  .directive('mdCheckbox', MdCheckboxDirective);

/**
 * @ngdoc directive
 * @name mdCheckbox
 * @module material.components.checkbox
 * @restrict E
 *
 * @description
 * The checkbox directive is used like the normal [angular checkbox](https://docs.angularjs.org/api/ng/input/input%5Bcheckbox%5D).
 *
 * As per the [material design spec](http://www.google.com/design/spec/style/color.html#color-color-schemes)
 * the checkbox is in the accent color by default. The primary color palette may be used with
 * the `md-primary` class.
 *
 * @param {string} ng-model Assignable angular expression to data-bind to.
 * @param {string=} name Property name of the form under which the control is published.
 * @param {expression=} ng-true-value The value to which the expression should be set when selected.
 * @param {expression=} ng-false-value The value to which the expression should be set when not selected.
 * @param {string=} ng-change AngularJS expression to be executed when input changes due to user interaction with the input element.
 * @param {boolean=} md-no-ink Use of attribute indicates use of ripple ink effects
 * @param {string=} aria-label Adds label to checkbox for accessibility.
 *     Defaults to checkbox's text. If no default text is found, a warning will be logged.
 * @param {expression=} md-indeterminate This determines when the checkbox should be rendered as 'indeterminate'.
 *     If a truthy expression or no value is passed in the checkbox renders in the md-indeterminate state.
 *     If falsy expression is passed in it just looks like a normal unchecked checkbox.
 *     The indeterminate, checked, and unchecked states are mutually exclusive. A box cannot be in any two states at the same time.
 *     Adding the 'md-indeterminate' attribute overrides any checked/unchecked rendering logic.
 *     When using the 'md-indeterminate' attribute use 'ng-checked' to define rendering logic instead of using 'ng-model'.
 * @param {expression=} ng-checked If this expression evaluates as truthy, the 'md-checked' css class is added to the checkbox and it
 *     will appear checked.
 *
 * @usage
 * <hljs lang="html">
 * <md-checkbox ng-model="isChecked" aria-label="Finished?">
 *   Finished ?
 * </md-checkbox>
 *
 * <md-checkbox md-no-ink ng-model="hasInk" aria-label="No Ink Effects">
 *   No Ink Effects
 * </md-checkbox>
 *
 * <md-checkbox ng-disabled="true" ng-model="isDisabled" aria-label="Disabled">
 *   Disabled
 * </md-checkbox>
 *
 * </hljs>
 *
 */
function MdCheckboxDirective(inputDirective, $mdAria, $mdConstant, $mdTheming, $mdUtil, $mdInteraction) {
  inputDirective = inputDirective[0];

  return {
    restrict: 'E',
    transclude: true,
    require: ['^?mdInputContainer', '?ngModel', '?^form'],
    priority: $mdConstant.BEFORE_NG_ARIA,
    template:
      '<div class="md-container" md-ink-ripple md-ink-ripple-checkbox>' +
        '<div class="md-icon"></div>' +
      '</div>' +
      '<div ng-transclude class="md-label"></div>',
    compile: compile
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function compile (tElement, tAttrs) {
    tAttrs.$set('tabindex', tAttrs.tabindex || '0');
    tAttrs.$set('type', 'checkbox');
    tAttrs.$set('role', tAttrs.type);

    return  {
      pre: function(scope, element) {
        // Attach a click handler during preLink, in order to immediately stop propagation
        // (especially for ng-click) when the checkbox is disabled.
        element.on('click', function(e) {
          if (this.hasAttribute('disabled')) {
            e.stopImmediatePropagation();
          }
        });
      },
      post: postLink
    };

    function postLink(scope, element, attr, ctrls) {
      var isIndeterminate;
      var containerCtrl = ctrls[0];
      var ngModelCtrl = ctrls[1] || $mdUtil.fakeNgModel();
      var formCtrl = ctrls[2];

      if (containerCtrl) {
        var isErrorGetter = containerCtrl.isErrorGetter || function() {
          return ngModelCtrl.$invalid && (ngModelCtrl.$touched || (formCtrl && formCtrl.$submitted));
        };

        containerCtrl.input = element;

        scope.$watch(isErrorGetter, containerCtrl.setInvalid);
      }

      $mdTheming(element);

      // Redirect focus events to the root element, because IE11 is always focusing the container element instead
      // of the md-checkbox element. This causes issues when using ngModelOptions: `updateOnBlur`
      element.children().on('focus', function() {
        element.focus();
      });

      if ($mdUtil.parseAttributeBoolean(attr.mdIndeterminate)) {
        setIndeterminateState();
        scope.$watch(attr.mdIndeterminate, setIndeterminateState);
      }

      if (attr.ngChecked) {
        scope.$watch(scope.$eval.bind(scope, attr.ngChecked), function(value) {
          ngModelCtrl.$setViewValue(value);
          ngModelCtrl.$render();
        });
      }

      $$watchExpr('ngDisabled', 'tabindex', {
        true: '-1',
        false: attr.tabindex
      });

      $mdAria.expectWithText(element, 'aria-label');

      // Reuse the original input[type=checkbox] directive from AngularJS core.
      // This is a bit hacky as we need our own event listener and own render
      // function.
      inputDirective.link.pre(scope, {
        on: angular.noop,
        0: {}
      }, attr, [ngModelCtrl]);

      element.on('click', listener)
        .on('keypress', keypressHandler)
        .on('focus', function() {
          if ($mdInteraction.getLastInteractionType() === 'keyboard') {
            element.addClass('md-focused');
          }
        })
        .on('blur', function() {
          element.removeClass('md-focused');
        });

      ngModelCtrl.$render = render;

      function $$watchExpr(expr, htmlAttr, valueOpts) {
        if (attr[expr]) {
          scope.$watch(attr[expr], function(val) {
            if (valueOpts[val]) {
              element.attr(htmlAttr, valueOpts[val]);
            }
          });
        }
      }

      function keypressHandler(ev) {
        var keyCode = ev.which || ev.keyCode;
        if (keyCode === $mdConstant.KEY_CODE.SPACE || keyCode === $mdConstant.KEY_CODE.ENTER) {
          ev.preventDefault();
          element.addClass('md-focused');
          listener(ev);
        }
      }

      function listener(ev) {
        // skipToggle boolean is used by the switch directive to prevent the click event
        // when releasing the drag. There will be always a click if releasing the drag over the checkbox
        if (element[0].hasAttribute('disabled') || scope.skipToggle) {
          return;
        }

        scope.$apply(function() {
          // Toggle the checkbox value...
          var viewValue = attr.ngChecked && attr.ngClick ? attr.checked : !ngModelCtrl.$viewValue;

          ngModelCtrl.$setViewValue(viewValue, ev && ev.type);
          ngModelCtrl.$render();
        });
      }

      function render() {
        // Cast the $viewValue to a boolean since it could be undefined
        element.toggleClass('md-checked', !!ngModelCtrl.$viewValue && !isIndeterminate);
      }

      function setIndeterminateState(newValue) {
        isIndeterminate = newValue !== false;
        if (isIndeterminate) {
          element.attr('aria-checked', 'mixed');
        }
        element.toggleClass('md-indeterminate', isIndeterminate);
      }
    }
  }
}
