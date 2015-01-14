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
  .directive('textarea', inputTextareaDirective)
  .directive('mdMaxlength', mdMaxlengthDirective);

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

    self.element = $element;
    self.setFocused = function(isFocused) {
      $element.toggleClass('md-input-focused', !!isFocused);
    };
    self.setHasValue = function(hasValue) {
      $element.toggleClass('md-input-has-value', !!hasValue);
    };
    self.setInvalid = function(isInvalid) {
      $element.toggleClass('md-input-invalid', !!isInvalid);
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

/**
 * @ngdoc directive
 * @name input
 * @restrict E
 * @module material.components.input
 *
 * @description
 * Must be placed as a child of an `<md-input-container>`. 
 *
 * Behaves like the [AngularJS input directive](https://docs.angularjs.org/api/ng/directive/input).
 *
 * @usage
 * <hljs lang="html">
 * <md-input-container>
 *   <label>Color</label>
 *   <input type="text" ng-model="color" required md-maxlength="10">
 * </md-input-container>
 * </hljs>
 * <h3>With Errors (uses [ngMessages](https://docs.angularjs.org/api/ngMessages))</h3>
 * <hljs lang="html">
 * <form name="userForm">
 *   <md-input-container>
 *     <label>Last Name</label>
 *     <input name="lastName" ng-model="lastName" required md-maxlength="10" minlength="4">
 *     <div ng-messages="userForm.lastName.$error">
 *       <div ng-message="required">This is required!</div>
 *       <div ng-message="md-maxlength">That's too long!</div>
 *       <div ng-message="minlength">That's too short!</div>
 *     </div>
 *   </md-input-container>
 * </form>
 * </hljs>
 *
 * @param {number=} md-maxlength The maximum number of characters allowed in this input. If this is specified, a character counter will be shown underneath the input.
 */
/**
 * @ngdoc directive
 * @name textarea
 * @restrict E
 * @module material.components.input
 *
 * @description
 * Must be placed as a child of an `<md-input-container>`. 
 *
 * Behaves like the [AngularJS input directive](https://docs.angularjs.org/api/ng/directive/textarea).
 *
 * @usage
 * <hljs lang="html">
 * <md-input-container>
 *   <label>Description</label>
 *   <textarea ng-model="description" required minlength="15" md-maxlength="20"></textarea>
 * </md-input-container>
 * </hljs>
 * <h3>With Errors (uses [ngMessages](https://docs.angularjs.org/api/ngMessages))</h3>
 * <hljs lang="html">
 * <form name="userForm">
 *   <md-input-container>
 *     <label>Biography</label>
 *     <textarea name="bio" ng-model="biography" required md-maxlength="150"></textarea>
 *     <div ng-messages="userForm.bio.$error">
 *       <div ng-message="required">This is required!</div>
 *       <div ng-message="md-maxlength">That's too long!</div>
 *     </div>
 *   </md-input-container>
 * </form>
 * </hljs>
 *
 * @param {number=} md-maxlength The maximum number of characters allowed in this input. If this is specified, a character counter will be shown underneath the input.
 */
function inputTextareaDirective($mdUtil, $window, $compile, $animate) {
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
    containerCtrl.input = element;

    if (!element.attr('id')) {
      element.attr('id', 'input_' + $mdUtil.nextUid());
    }

    if (element[0].tagName.toLowerCase() === 'textarea') {
      setupTextarea();
    }

    // When the input value changes, check if it "has" a value, and
    // set the appropriate class on the input group
    if (ngModelCtrl) {
      scope.$watch(function() {
        return ngModelCtrl.$dirty && ngModelCtrl.$invalid;
      }, function(isDirtyAndInvalid) {
        containerCtrl.setInvalid(isDirtyAndInvalid);
      });
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
        if (e.target && e.target.validity && e.target.validity.badInput) {
          containerCtrl.setHasValue(false);
        }
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
      element.on('keyup', growTextarea);
      element.on('scroll', onScroll);
      angular.element($window).on('resize', growTextarea);

      scope.$on('$destroy', function() {
        angular.element($window).off('resize', growTextarea);
      });

      function growTextarea(value) {
        node.style.height = "auto";
        var line = node.scrollHeight - node.offsetHeight;
        node.scrollTop = 0;
        var height = node.offsetHeight + (line > 0 ? line : 0);
        node.style.height = height + 'px';

        return value; // for $formatter/$parser
      }

      function onScroll(e) {
        node.scrollTop = 0;
        // for smooth new line adding
        var line = node.scrollHeight - node.offsetHeight;
        var height = node.offsetHeight + line;
        node.style.height = height + 'px';
      }
    }
  }
}

function mdMaxlengthDirective() {
  return {
    restrict: 'A',
    require: ['ngModel', '^mdInputContainer'],
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {
    var maxlength;
    var ngModelCtrl = ctrls[0];
    var containerCtrl = ctrls[1];
    var charCountEl = angular.element('<div class="md-char-counter">');

    containerCtrl.element.append(charCountEl);
    ngModelCtrl.$formatters.push(renderCharCount);
    element.on('input', renderCharCount);

    scope.$watch(attr.mdMaxlength, function(value) {
      maxlength = value;
      if (angular.isNumber(value) && value > 0) {
        if (!charCountEl.parent().length) {
          $animate.enter(charCountEl, containerCtrl.element, 
                         angular.element(containerCtrl.element[0].lastElementChild));
        }
        renderCharCount();
      } else {
        $animate.leave(charCountEl);
      }
    });

    ngModelCtrl.$validators['md-maxlength'] = function(modelValue, viewValue) {
      var value = modelValue || viewValue;
      if (!angular.isNumber(maxlength) || maxlength < 0) {
        return true;
      }
      return (value || '').length < maxlength;
    };

    function renderCharCount(value) {
      charCountEl.text( element.val().length + '/' + maxlength );
      return value;
    }
  }
}

})();
