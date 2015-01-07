(function() {

/**
 * @ngdoc module
 * @name material.components.input
 */

angular.module('material.components.input', [
  'material.core'
])
  .directive('mdInputContainer', mdInputContainerDirective)
  .directive('label', labelDirective)
  .directive('input', inputDirective)
  .directive('textarea', inputDirective);

/**
 * @ngdoc directive
 * @name mdInputContainer
 * @module material.components.input
 *
 * @restrict E
 *
 * @description
 * `<md-input-container>` is the parent of any input or textarea element.
 *
 * Input and textarea elements will not behave properly unless the md-input-container 
 * parent is provided.
 *
 * @usage
 * <hljs lang="html">
 *
 * <md-input-container>
 *   <label>Username</label>
 *   <input type="text" ng-model="user.name">
 * </md-input-container>
 *
 * <md-input-container>
 *   <label>Description</label>
 *   <textarea ng-model="user.description"></textarea>
 * </md-input-container>
 *
 * </hljs>
 */
function mdInputContainerDirective($mdTheming) {
  return {
    restrict: 'E',
    link: postLink,
    controller: ContainerCtrl
  };

  function postLink(scope, element, attr) {
    $mdTheming(element);
  }
  function ContainerCtrl($scope, $element, $mdUtil) {
    var self = this;

    self.setFocused = function(isFocused) {
      $element.toggleClass('md-input-focused', !!isFocused);
    };
    self.setHasValue = function(hasValue) {
      $element.toggleClass('md-input-has-value', !!hasValue);
    };

    $scope.$watch(function() {
      return self.label && self.input;
    }, function(hasLabelAndInput) {
      if (hasLabelAndInput && !self.label.attr('for')) {
        self.label.attr('for', self.input.attr('id'));
      }
    });
  }
}

function labelDirective() {
  return {
    restrict: 'E',
    require: '^?mdInputContainer',
    link: function(scope, element, attr, containerCtrl) {
      if (!containerCtrl) return;

      containerCtrl.label = element;
      scope.$on('$destroy', function() {
        containerCtrl.label = null;
      });
    }
  };
}

function inputDirective($mdUtil) {
  return {
    restrict: 'E',
    require: ['^?mdInputContainer', '?ngModel'],
    compile: compile,
  };
  
  function compile(element) {
    element.addClass('md-input');
    return postLink;
  }
  function postLink(scope, element, attr, ctrls) {

    var containerCtrl = ctrls[0];
    var ngModelCtrl = ctrls[1];

    if ( !containerCtrl ) return;

    if (containerCtrl.input) {
      throw new Error("<md-input-container> can only have *one* <input> or <textarea> child element!");
    }
    if (!element.attr('id')) {
      element.attr('id', 'input_' + $mdUtil.nextUid());
    }

    containerCtrl.input = element;

    // When the input value changes, check if it "has" a value, and
    // set the appropriate class on the input group
    if (ngModelCtrl) {
      ngModelCtrl.$formatters.push(checkHasValue);
      ngModelCtrl.$parsers.push(checkHasValue);
    } else {
      element.on('input', function() {
        containerCtrl.setHasValue( (""+element.val()).length > 0 );
      });
      containerCtrl.setHasValue( (""+element.val()).length > 0 );
    }
    function checkHasValue(value) {
      containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(value));
      return value;
    }

    element
      .on('focus', function(e) {
        containerCtrl.setFocused(true);
      })
      .on('blur', function(e) {
        containerCtrl.setFocused(false);
      });

    scope.$on('$destroy', function() {
      containerCtrl.setFocused(false);
      containerCtrl.setHasValue(false);
      containerCtrl.input = null;
    });

    function isNotEmpty(value) {
      value = angular.isUndefined(value) ? element.val() : value;
      return (angular.isDefined(value) && (value!==null) &&
             (value.toString().trim() !== ""));
    }
  }
}

})();
