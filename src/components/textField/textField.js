/**
 * @ngdoc module
 * @name material.components.textField
 * @description
 * Form
 */
angular.module('material.components.textField', [])
  .directive('materialInputGroup', [
    materialInputGroupDirective
  ])
  .directive('materialInput', [
    materialInputDirective
  ]);

/**
 * @ngdoc directive
 * @name materialInputGroup
 * @module material.components.textField
 * @restrict E
 * @description
 * Use the `<material-input-group>` directive as the grouping parent of a `<material-input>` element.
 *
 * @usage 
 * <hljs lang="html">
 * <material-input-group ng-disabled="isDisabled">
 *   <label for="{{fid}}">{{someLabel}}</label>
 *   <material-input id="{{fid}}" type="text" ng-model="someText"></material-input>
 * </material-input-group>
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

/**
 * @ngdoc directive
 * @name materialInput
 * @module material.components.textField
 *
 * @restrict E
 *
 * @description
 * Use the `<material-input>` directive as elements within a `<material-input-group>` container
 *
 * @usage
 * <hljs lang="html">
 * <material-input-group ng-disabled="user.isLocked">
 *   <label for="i1">FirstName</label>
 *   <material-input id="i1" type="text" ng-model="user.firstName"></material-input>
 * </material-input-group>
 * </hljs>
 */
function materialInputDirective() {
  return {
    restrict: 'E',
    replace: true,
    template: '<input type="text">',
    require: ['^?materialInputGroup', '?ngModel'],
    link: function(scope, element, attr, ctrls) {
      var inputGroupCtrl = ctrls[0];
      var ngModelCtrl = ctrls[1];
      if (!inputGroupCtrl) {
        return;
      }

      if ( Util.isParentDisabled(element.parent()) ) {
        // tab focus not allowed
        element.attr('tabindex', -1);
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
