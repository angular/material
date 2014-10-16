/**
 * @ngdoc module
 * @name material.components.textField
 * @description
 * Form
 */
angular.module('material.components.textField', ['material.core'])
       .directive('mdInputGroup', [ mdInputGroupDirective ])
       .directive('mdInput', ['$mdUtil', mdInputDirective ])
       .directive('mdTextFloat', [ mdTextFloatDirective ]);



/**
 * @ngdoc directive
 * @name mdTextFloat
 * @module material.components.textField
 *
 * @restrict E
 *
 * @description
 * Use the `<md-text-float>` directive to quickly construct `Floating Label` text fields
 *
 * @param {string} label Attribute to specify the input text field hint.
 * @param {string=} ng-model Optional value to assign as existing input text string
 * @param {string=} type Optional value to define the type of input field. Defaults to string.
 *
 * @usage
 * <hljs lang="html">
 * <md-text-float label="LastName" ng-model="user.lastName" > </md-text-float>
 *
 * <!-- Specify a read-only input field by using the `disabled` attribute -->
 * <md-text-float label="Company"  ng-model="user.company"    disabled > </md-text-float>
 *
 * <!-- Specify an input type if desired. -->
 * <md-text-float label="eMail"    ng-model="user.email" type="email" ></md-text-float>
 * </hljs>
 */
function mdTextFloatDirective() {
  return {
    restrict: 'E',
    replace: true,
    scope : {
      fid : '@?',
      value : '=ngModel'
    },
    compile : function() {
      return {
        pre : function(scope, element, attrs) {
          // transpose `disabled` flag
          if ( angular.isDefined(attrs.disabled) ) {
            element.attr('disabled', true);
            scope.isDisabled = true;
          }

          // transpose the `label` value
          scope.label = attrs.label || "";
          scope.fid = scope.fid || scope.label;

          // transpose optional `type` and `class` settings
          element.attr('type', attrs.type || "text");
          element.attr('class', attrs.class );
        }
      };
    },
    template:
    '<md-input-group ng-disabled="isDisabled">' +
    ' <label for="{{fid}}">{{label}}</label>' +
    ' <md-input id="{{fid}}" ng-model="value">' +
    '</md-input-group>'
  };
}

/*
 * @private
 *
 * @ngdoc directive
 * @name mdInputGroup
 * @module material.components.textField
 * @restrict E
 * @description
 * Use the `<md-input-group>` directive as the grouping parent of a `<md-input>` element.
 *
 * @usage 
 * <hljs lang="html">
 * <md-input-group ng-disabled="isDisabled">
 *   <label for="{{fid}}">{{someLabel}}</label>
 *   <md-input id="{{fid}}" type="text" ng-model="someText"></md-input>
 * </md-input-group>
 * </hljs>
 */
function mdInputGroupDirective() {
  return {
    restrict: 'CE',
    controller: ['$element', function($element) {
      this.setFocused = function(isFocused) {
        $element.toggleClass('md-input-focused', !!isFocused);
      };
      this.setHasValue = function(hasValue) {
        $element.toggleClass('md-input-has-value', !!hasValue);
      };
    }]
  };
}

/*
 * @private
 *
 * @ngdoc directive
 * @name mdInput
 * @module material.components.textField
 *
 * @restrict E
 *
 * @description
 * Use the `<md-input>` directive as elements within a `<md-input-group>` container
 *
 * @usage
 * <hljs lang="html">
 * <md-input-group ng-disabled="user.isLocked">
 *   <label for="i1">FirstName</label>
 *   <md-input id="i1" ng-model="user.firstName"></md-input>
 * </md-input-group>
 * </hljs>
 */
function mdInputDirective($mdUtil) {
  return {
    restrict: 'E',
    replace: true,
    template: '<input >',
    require: ['^?mdInputGroup', '?ngModel'],
    link: function(scope, element, attr, ctrls) {
      var inputGroupCtrl = ctrls[0];
      var ngModelCtrl = ctrls[1];
      if (!inputGroupCtrl) {
        return;
      }

      // scan for disabled and transpose the `type` value to the <input> element
      var isDisabled = $mdUtil.isParentDisabled(element);

      element.attr('tabindex', isDisabled ? -1 : 0 );
      element.attr('type', attr.type || element.parent().attr('type') || "text" );

      // When the input value changes, check if it "has" a value, and
      // set the appropriate class on the input group
      if (ngModelCtrl) {
        //Add a $formatter so we don't use up the render function
        ngModelCtrl.$formatters.push(function(value) {
          inputGroupCtrl.setHasValue(angular.isDefined(value) && value!==null );
          return value;
        });
      }

      element.on('input', function() {
        var value = element.val();

        inputGroupCtrl.setHasValue(angular.isDefined(value) && value!==null);
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




