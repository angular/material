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
  .directive('input', inputTextareaDirective)
  .directive('textarea', inputTextareaDirective);

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

function inputTextareaDirective($mdUtil, $window) {
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

    if (element[0].tagName.toLowerCase() === 'textarea') {
      setupTextarea();
    }

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

    function setupTextarea() {
      var node = element[0];

      if (ngModelCtrl) {
        ngModelCtrl.$formatters.push(growTextarea);
        ngModelCtrl.$parsers.push(growTextarea);
      } else {
        element.on('input', growTextarea);
        growTextarea();
      }
      element.on('keydown', growTextarea);
      element.on('scroll', onScroll);
      angular.element($window).on('resize', growTextarea);

      scope.$on('$destroy', function() {
        angular.element($window).off('resize', growTextarea);
      });

      function growTextarea(value) {
        node.style.height = "auto";
        var line = node.scrollHeight - node.offsetHeight;
        node.scrollTop = 0;
        height = node.offsetHeight + (line > 0 ? line : 0);
        node.style.height = height + 'px';

        return value; // for $formatter/$parser
      }
      
      function onScroll(e) {
        node.scrollTop = 0;
        // for smooth new line adding
        var line = node.scrollHeight - node.offsetHeight;
        height = node.offsetHeight + line;
        node.style.height = height + 'px';
      }
    }
  }
}

})();
