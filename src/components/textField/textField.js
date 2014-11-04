/**
 * @ngdoc module
 * @name material.components.textField
 * @description
 * Form
 */
angular.module('material.components.textField', ['material.core', 'material.services.theming'])
  .directive('mdInputGroup', [ mdInputGroupDirective ])
  .directive('mdInput', ['$mdUtil', mdInputDirective ])
  .directive('mdTextarea', ['$mdUtil', mdTextareaDirective])
  .directive('mdTextFloat', [ '$mdTheming', '$mdUtil', mdTextFloatDirective ])
  .directive('mdTextareaFloat', [ '$mdTheming', '$mdUtil', mdTextareaFloatDirective ]);


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
 * @param {string} fid Attribute used for accessibility link pairing between the Label and Input elements
 * @param {string=} type Optional value to define the type of input field. Defaults to string.
 * @param {string} label Attribute to specify the input text field hint.
 * @param {string=} ng-model Optional value to assign as existing input text string
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
function mdTextFloatDirective($mdTheming, $mdUtil) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      fid: '@?',
      label: '@?',
      value: '=ngModel'
    },
    compile: function (element, attr) {

      if (angular.isUndefined(attr.fid)) {
        attr.fid = $mdUtil.nextUid();
      }

      return {
        pre: function (scope, element, attrs) {
          // transpose `disabled` flag
          if (angular.isDefined(attrs.disabled)) {
            element.attr('disabled', true);
            scope.isDisabled = true;
          }

          scope.inputType = attrs.type || "text";
          element.removeAttr('type');

          // transpose optional `class` settings
          element.attr('class', attrs.class);

        },
        post: $mdTheming
      };
    },
    template: '<md-input-group ng-disabled="isDisabled" tabindex="-1">' +
      ' <label for="{{fid}}" >{{label}}</label>' +
      ' <md-input id="{{fid}}" ng-model="value" type="{{inputType}}"></md-input>' +
      '</md-input-group>'
  };
}

/**
 * @ngdoc directive
 * @name mdTextareaFloat
 * @module material.components.textField
 *
 * @restrict E
 *
 * @description
 * Use the `<md-textarea-float>` directive to quickly construct `Floating Label` textarea fields
 *
 * @param {string} fid Attribute used for accessibility link pairing between the Label and Input elements
 * @param {string=} rows Optional value to define the amount of rows.
 * @param {string=} cols Optional value to define the amount of cols.
 * @param {string} label Attribute to specify the input text field hint.
 * @param {string=} ng-model Optional value to assign as existing input text string
 *
 * @usage
 * <hljs lang="html">
 * <md-textarea-float label="Intro" ng-model="user.intro" > </md-textarea-float>
 *
 * <!-- Specify the amount of rows and cols. -->
 * <md-textarea-float label="Company"  ng-model="user.company" rows="4" cols="50" > </md-textarea-float>
 * </hljs>
 */
function mdTextareaFloatDirective($mdTheming, $mdUtil) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      fid: '@?',
      label: '@?',
      rows: '@?',
      cols: '@?',
      value: '=ngModel'
    },
    compile: function (element, attr) {

      if (angular.isUndefined(attr.fid)) {
        attr.fid = $mdUtil.nextUid();
      }

      return {
        pre: function (scope, element, attrs) {
          // transpose `disabled` flag
          if (angular.isDefined(attrs.disabled)) {
            element.attr('disabled', true);
            scope.isDisabled = true;
          }

          // transpose optional `class` settings
          element.attr('class', attrs.class);

        },
        post: $mdTheming
      };
    },
    template: '<md-input-group ng-disabled="isDisabled" tabindex="-1">' +
      ' <label for="{{fid}}" >{{label}}</label>' +
      ' <md-textarea id="{{fid}}" ng-model="value" ' +
      '  rows="{{rows}}" cols="{{cols}}"></md-textarea>' +
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
    controller: ['$element', function ($element) {
      this.setFocused = function (isFocused) {
        $element.toggleClass('md-input-focused', !!isFocused);
      };
      this.setHasValue = function (hasValue) {
        $element.toggleClass('md-input-has-value', hasValue);
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
    link: function mdInputDirectiveLink(scope, element, attr, ctrls) {
      linkBehaviours(scope, element, ctrls, $mdUtil);

      element.attr('type', attr.type || element.parent().attr('type') || "text");
    }
  };
}

/*
 * @private
 *
 * @ngdoc directive
 * @name mdTextarea
 * @module material.components.textField
 *
 * @restrict E
 *
 * @description
 * Use the `<md-textarea>` directive as elements within a `<md-input-group>` container
 *
 * @usage
 * <hljs lang="html">
 * <md-input-group ng-disabled="user.isLocked">
 *   <label for="i1">Intro</label>
 *   <md-textarea id="i1" ng-model="user.intro"></md-textarea>
 * </md-input-group>
 * </hljs>
 */
function mdTextareaDirective($mdUtil) {
  return {
    restrict: 'E',
    replace: true,
    template: '<textarea >',
    require: ['^?mdInputGroup', '?ngModel'],
    link: function mdInputDirectiveLink(scope, element, attr, ctrls) {
      linkBehaviours(scope, element, ctrls, $mdUtil);

      element.attr('rows', attr.rows || element.parent().attr('rows') || "8");
      element.attr('cols', attr.cols || element.parent().attr('cols') || "100");
    }
  };
}

/*
 * @private
 *
 * @ngdoc directive
 * @name mdTextarea
 * @module material.components.textField
 * @function
 *
 * @description
 * The link function used in the mdInput and mdTextarea
 *
 */
function linkBehaviours(scope, element, ctrls, $mdUtil) {
  var inputGroupCtrl = ctrls[0];
  var ngModelCtrl = ctrls[1];
  if (!inputGroupCtrl) {
    return;
  }

  // scan for disabled and transpose the `type` value to the <input> element
  var isDisabled = $mdUtil.isParentDisabled(element);

  element.attr('tabindex', isDisabled ? -1 : 0);
  element.attr('aria-disabled', isDisabled ? 'true' : 'false');

  // When the input value changes, check if it "has" a value, and
  // set the appropriate class on the input group
  if (ngModelCtrl) {
    //Add a $formatter so we don't use up the render function
    ngModelCtrl.$formatters.push(function (value) {
      inputGroupCtrl.setHasValue(isNotEmpty(value));
      return value;
    });
  }

  element.on('input', function () {
    inputGroupCtrl.setHasValue(isNotEmpty());
  });

  // When the input focuses, add the focused class to the group
  element.on('focus', function (e) {
    inputGroupCtrl.setFocused(true);
  });
  // When the input blurs, remove the focused class from the group
  element.on('blur', function (e) {
    inputGroupCtrl.setFocused(false);
    inputGroupCtrl.setHasValue(isNotEmpty());
  });

  scope.$on('$destroy', function () {
    inputGroupCtrl.setFocused(false);
    inputGroupCtrl.setHasValue(false);
  });


  function isNotEmpty(value) {
    value = angular.isUndefined(value) ? element.val() : value;
    return (angular.isDefined(value) && (value !== null) &&
      (value.toString().trim() != ""));
  }
}




