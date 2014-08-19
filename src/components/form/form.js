/**
 * @ngdoc module
 * @name material.components.form
 * @description
 * Form
 */
angular.module('material.components.form', [])
  .directive('materialInputGroup', [
    materialInputGroupDirective
  ])
  .directive('input', [
    groupInputDirective
  ]);

/**
 * @private
 * @ngdoc directive
 * @name materialInputGroup
 * @module material.components.form
 * @restrict E
 * @description
 * Put the `<material-input-group>` directive as the parent of an `<input>` element to
 * add proper styling for the input.
 *
 * @usage 
 * <hljs lang="html">
 * <material-input-group>
 *   <input type="text" ng-model="myText">
 * </material-input-group
 * </hljs>
 */
function materialInputGroupDirective() {
  return {
    restrict: 'CE',
    controller: ['$element', function($element) {
      this.setFocused = function(isFocused) {
        $element.toggleClass('material-input-focused', !!isFocused);
      };
      this.setHasValue = function(hasValue) {
        $element.toggleClass('material-input-has-value', !!hasValue);
      };
    }]
  };
}

function groupInputDirective() {
  return {
    restrict: 'E',
    require: ['^?materialInputGroup', '?ngModel'],
    link: function(scope, element, attr, ctrls) {
      var inputGroupCtrl = ctrls[0];
      var ngModelCtrl = ctrls[1];
      if (!inputGroupCtrl) {
        return;
      }

      // When the input value changes, check if it "has" a value, and 
      // set the appropriate class on the input group
      if (ngModelCtrl) {
        //Add a $formatter so we don't use up the render function
        ngModelCtrl.$formatters.push(function(value) {
          inputGroupCtrl.setHasValue(!!value);
          return value;
        });
      }
      element.on('input', function() {
        inputGroupCtrl.setHasValue(!!element.val());
      });

      // When the input focuses, add the focused class to the group
      element.on('focus', function(e) {
        inputGroupCtrl.setFocused(true);
      });
      // When the input blurs, remove the focused class from the group
      element.on('blur', function(e) {
        inputGroupCtrl.setFocused(false);
      });

      scope.$on('$destroy', function() {
        inputGroupCtrl.setFocused(false);
        inputGroupCtrl.setHasValue(false);
      });
    }
  };
}
