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
  .directive('mdMaxlength', mdMaxlengthDirective)
  .directive('placeholder', placeholderDirective)
  .directive('ngMessages', ngMessagesDirective)
  .directive('ngMessage', ngMessageDirective)
  .directive('ngMessageExp', ngMessageDirective)
  .directive('mdSelectOnFocus', mdSelectOnFocusDirective)

  .animation('.md-input-invalid', mdInputInvalidMessagesAnimation)
  .animation('.md-input-messages-animation', ngMessagesAnimation)
  .animation('.md-input-message-animation', ngMessageAnimation);

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
 * @param md-is-error {expression=} When the given expression evaluates to true, the input container
 *   will go into error state. Defaults to erroring if the input has been touched and is invalid.
 * @param md-no-float {boolean=} When present, `placeholder` attributes on the input will not be converted to floating
 *   labels.
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
 *
 * <h3>When disabling floating labels</h3>
 * <hljs lang="html">
 *
 * <md-input-container md-no-float>
 *   <input type="text" placeholder="Non-Floating Label">
 * </md-input-container>
 *
 * </hljs>
 */
function mdInputContainerDirective($mdTheming, $parse) {

  var INPUT_TAGS = ['INPUT', 'TEXTAREA', 'MD-SELECT'];

  return {
    restrict: 'E',
    link: postLink,
    controller: ContainerCtrl
  };

  function postLink(scope, element) {
    $mdTheming(element);

    var iconElements = element.find('md-icon');
    var icons = iconElements.length ? iconElements : element[0].getElementsByClassName('md-icon');

    // Incase there's one icon we want to identify where the icon is (right or left) and apply the related class
    if (icons.length == 1) {
      var next = icons[0].nextElementSibling;
      var previous = icons[0].previousElementSibling;

      element.addClass(next && INPUT_TAGS.indexOf(next.tagName) != -1 ? 'md-icon-left' :
                       previous &&  INPUT_TAGS.indexOf(previous.tagName) != -1 ? 'md-icon-right' : '');
    }
    // In case there are two icons we apply both icon classes
    else if (icons.length == 2) {
      element.addClass('md-icon-left md-icon-right');
    }
  }

  function ContainerCtrl($scope, $element, $attrs, $animate) {
    var self = this;

    self.isErrorGetter = $attrs.mdIsError && $parse($attrs.mdIsError);

    self.delegateClick = function() {
      self.input.focus();
    };
    self.element = $element;
    self.setFocused = function(isFocused) {
      $element.toggleClass('md-input-focused', !!isFocused);
    };
    self.setHasValue = function(hasValue) {
      $element.toggleClass('md-input-has-value', !!hasValue);
    };
    self.setHasPlaceholder = function(hasPlaceholder) {
      $element.toggleClass('md-input-has-placeholder', !!hasPlaceholder);
    };
    self.setInvalid = function(isInvalid) {
      if (isInvalid) {
        $animate.addClass($element, 'md-input-invalid');
      } else {
        $animate.removeClass($element, 'md-input-invalid');
      }
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
      if (!containerCtrl || attr.mdNoFloat || element.hasClass('md-container-ignore')) return;

      containerCtrl.label = element;
      scope.$on('$destroy', function() {
        containerCtrl.label = null;
      });
    }
  };
}

/**
 * @ngdoc directive
 * @name mdInput
 * @restrict E
 * @module material.components.input
 *
 * @description
 * You can use any `<input>` or `<textarea>` element as a child of an `<md-input-container>`. This
 * allows you to build complex forms for data entry.
 *
 * @param {number=} md-maxlength The maximum number of characters allowed in this input. If this is
 *   specified, a character counter will be shown underneath the input.<br/><br/>
 *   The purpose of **`md-maxlength`** is exactly to show the max length counter text. If you don't
 *   want the counter text and only need "plain" validation, you can use the "simple" `ng-maxlength`
 *   or maxlength attributes.
 * @param {string=} aria-label Aria-label is required when no label is present.  A warning message
 *   will be logged in the console if not present.
 * @param {string=} placeholder An alternative approach to using aria-label when the label is not
 *   PRESENT. The placeholder text is copied to the aria-label attribute.
 * @param md-no-autogrow {boolean=} When present, textareas will not grow automatically.
 * @param md-no-asterisk {boolean=} When present, asterisk will not be appended to required inputs label
 * @param md-detect-hidden {boolean=} When present, textareas will be sized properly when they are
 *   revealed after being hidden. This is off by default for performance reasons because it
 *   guarantees a reflow every digest cycle.
 *
 * @usage
 * <hljs lang="html">
 * <md-input-container>
 *   <label>Color</label>
 *   <input type="text" ng-model="color" required md-maxlength="10">
 * </md-input-container>
 * </hljs>
 *
 * <h3>With Errors</h3>
 *
 * `md-input-container` also supports errors using the standard `ng-messages` directives and
 * animates the messages when they become visible using from the `ngEnter`/`ngLeave` events or
 * the `ngShow`/`ngHide` events.
 *
 * By default, the messages will be hidden until the input is in an error state. This is based off
 * of the `md-is-error` expression of the `md-input-container`. This gives the user a chance to
 * fill out the form before the errors become visible.
 *
 * <hljs lang="html">
 * <form name="colorForm">
 *   <md-input-container>
 *     <label>Favorite Color</label>
 *     <input name="favoriteColor" ng-model="favoriteColor" required>
 *     <div ng-messages="userForm.lastName.$error">
 *       <div ng-message="required">This is required!</div>
 *     </div>
 *   </md-input-container>
 * </form>
 * </hljs>
 *
 * We automatically disable this auto-hiding functionality if you provide any of the following
 * visibility directives on the `ng-messages` container:
 *
 *  - `ng-if`
 *  - `ng-show`/`ng-hide`
 *  - `ng-switch-when`/`ng-switch-default`
 *
 * You can also disable this functionality manually by adding the `md-auto-hide="false"` expression
 * to the `ng-messages` container. This may be helpful if you always want to see the error messages
 * or if you are building your own visibilty directive.
 *
 * _<b>Note:</b> The `md-auto-hide` attribute is a static string that is  only checked upon
 * initialization of the `ng-messages` directive to see if it equals the string `false`._
 *
 * <hljs lang="html">
 * <form name="userForm">
 *   <md-input-container>
 *     <label>Last Name</label>
 *     <input name="lastName" ng-model="lastName" required md-maxlength="10" minlength="4">
 *     <div ng-messages="userForm.lastName.$error" ng-show="userForm.lastName.$dirty">
 *       <div ng-message="required">This is required!</div>
 *       <div ng-message="md-maxlength">That's too long!</div>
 *       <div ng-message="minlength">That's too short!</div>
 *     </div>
 *   </md-input-container>
 *   <md-input-container>
 *     <label>Biography</label>
 *     <textarea name="bio" ng-model="biography" required md-maxlength="150"></textarea>
 *     <div ng-messages="userForm.bio.$error" ng-show="userForm.bio.$dirty">
 *       <div ng-message="required">This is required!</div>
 *       <div ng-message="md-maxlength">That's too long!</div>
 *     </div>
 *   </md-input-container>
 *   <md-input-container>
 *     <input aria-label='title' ng-model='title'>
 *   </md-input-container>
 *   <md-input-container>
 *     <input placeholder='title' ng-model='title'>
 *   </md-input-container>
 * </form>
 * </hljs>
 *
 * <h3>Notes</h3>
 *
 * - Requires [ngMessages](https://docs.angularjs.org/api/ngMessages).
 * - Behaves like the [AngularJS input directive](https://docs.angularjs.org/api/ng/directive/input).
 *
 * The `md-input` and `md-input-container` directives use very specific positioning to achieve the
 * error animation effects. Therefore, it is *not* advised to use the Layout system inside of the
 * `<md-input-container>` tags. Instead, use relative or absolute positioning.
 *
 */

function inputTextareaDirective($mdUtil, $window, $mdAria) {
  return {
    restrict: 'E',
    require: ['^?mdInputContainer', '?ngModel'],
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {

    var containerCtrl = ctrls[0];
    var hasNgModel = !!ctrls[1];
    var ngModelCtrl = ctrls[1] || $mdUtil.fakeNgModel();
    var isReadonly = angular.isDefined(attr.readonly);
    var isRequired = angular.isDefined(attr.required);
    var mdNoAsterisk = angular.isDefined(attr.mdNoAsterisk);


    if (!containerCtrl) return;
    if (containerCtrl.input) {
      throw new Error("<md-input-container> can only have *one* <input>, <textarea> or <md-select> child element!");
    }
    containerCtrl.input = element;

    // Add an error spacer div after our input to provide space for the char counter and any ng-messages
    var errorsSpacer = angular.element('<div class="md-errors-spacer">');
    // element.after appending the div before the icon (if exist) which cause a problem with calculating which class to apply
    element.parent().append(errorsSpacer);

    if (!containerCtrl.label) {
      $mdAria.expect(element, 'aria-label', element.attr('placeholder'));
    } else if (isRequired && !mdNoAsterisk) {
      containerCtrl.label.addClass('md-required');
    }

    element.addClass('md-input');
    if (!element.attr('id')) {
      element.attr('id', 'input_' + $mdUtil.nextUid());
    }

    if (element[0].tagName.toLowerCase() === 'textarea') {
      setupTextarea();
    }

    // If the input doesn't have an ngModel, it may have a static value. For that case,
    // we have to do one initial check to determine if the container should be in the
    // "has a value" state.
    if (!hasNgModel) {
      inputCheckValue();
    }

    var isErrorGetter = containerCtrl.isErrorGetter || function() {
      return ngModelCtrl.$invalid && (ngModelCtrl.$touched || isParentFormSubmitted());
    };

    var isParentFormSubmitted = function () {
      var parent = $mdUtil.getClosest(element, 'form');
      var form = parent ? angular.element(parent).controller('form') : null;

      return form ? form.$submitted : false;
    };

    scope.$watch(isErrorGetter, containerCtrl.setInvalid);

    ngModelCtrl.$parsers.push(ngModelPipelineCheckValue);
    ngModelCtrl.$formatters.push(ngModelPipelineCheckValue);

    element.on('input', inputCheckValue);

    if (!isReadonly) {
      element
        .on('focus', function(ev) {
          containerCtrl.setFocused(true);
        })
        .on('blur', function(ev) {
          containerCtrl.setFocused(false);
          inputCheckValue();
        });

    }

    //ngModelCtrl.$setTouched();
    //if( ngModelCtrl.$invalid ) containerCtrl.setInvalid();

    scope.$on('$destroy', function() {
      containerCtrl.setFocused(false);
      containerCtrl.setHasValue(false);
      containerCtrl.input = null;
    });

    /**
     *
     */
    function ngModelPipelineCheckValue(arg) {
      containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(arg));
      return arg;
    }

    function inputCheckValue() {
      // An input's value counts if its length > 0,
      // or if the input's validity state says it has bad input (eg string in a number input)
      containerCtrl.setHasValue(element.val().length > 0 || (element[0].validity || {}).badInput);
    }

    function setupTextarea() {
      if (angular.isDefined(element.attr('md-no-autogrow'))) {
        return;
      }

      var node = element[0];
      var container = containerCtrl.element[0];

      var min_rows = NaN;
      var lineHeight = null;
      // can't check if height was or not explicity set,
      // so rows attribute will take precedence if present
      if (node.hasAttribute('rows')) {
        min_rows = parseInt(node.getAttribute('rows'));
      }

      var onChangeTextarea = $mdUtil.debounce(growTextarea, 1);

      function pipelineListener(value) {
        onChangeTextarea();
        return value;
      }

      if (ngModelCtrl) {
        ngModelCtrl.$formatters.push(pipelineListener);
        ngModelCtrl.$viewChangeListeners.push(pipelineListener);
      } else {
        onChangeTextarea();
      }
      element.on('keydown input', onChangeTextarea);

      if (isNaN(min_rows)) {
        element.attr('rows', '1');

        element.on('scroll', onScroll);
      }

      angular.element($window).on('resize', onChangeTextarea);

      scope.$on('$destroy', function() {
        angular.element($window).off('resize', onChangeTextarea);
      });

      function growTextarea() {
        // sets the md-input-container height to avoid jumping around
        container.style.height = container.offsetHeight + 'px';

        // temporarily disables element's flex so its height 'runs free'
        element.addClass('md-no-flex');

        if (isNaN(min_rows)) {
          node.style.height = "auto";
          node.scrollTop = 0;
          var height = getHeight();
          if (height) node.style.height = height + 'px';
        } else {
          node.setAttribute("rows", 1);

          if (!lineHeight) {
            node.style.minHeight = '0';

            lineHeight = element.prop('clientHeight');

            node.style.minHeight = null;
          }

          var rows = Math.min(min_rows, Math.round(node.scrollHeight / lineHeight));
          node.setAttribute("rows", rows);
          node.style.height = lineHeight * rows + "px";
        }

        // reset everything back to normal
        element.removeClass('md-no-flex');
        container.style.height = 'auto';
      }

      function getHeight() {
        var line = node.scrollHeight - node.offsetHeight;
        return node.offsetHeight + (line > 0 ? line : 0);
      }

      function onScroll(e) {
        node.scrollTop = 0;
        // for smooth new line adding
        var line = node.scrollHeight - node.offsetHeight;
        var height = node.offsetHeight + line;
        node.style.height = height + 'px';
      }

      // Attach a watcher to detect when the textarea gets shown.
      if (angular.isDefined(element.attr('md-detect-hidden'))) {

        var handleHiddenChange = function() {
          var wasHidden = false;

          return function() {
            var isHidden = node.offsetHeight === 0;

            if (isHidden === false && wasHidden === true) {
              growTextarea();
            }

            wasHidden = isHidden;
          };
        }();

        // Check every digest cycle whether the visibility of the textarea has changed.
        // Queue up to run after the digest cycle is complete.
        scope.$watch(function() {
          $mdUtil.nextTick(handleHiddenChange, false);
          return true;
        });
      }
    }
  }
}

function mdMaxlengthDirective($animate, $mdUtil) {
  return {
    restrict: 'A',
    require: ['ngModel', '^mdInputContainer'],
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {
    var maxlength;
    var ngModelCtrl = ctrls[0];
    var containerCtrl = ctrls[1];
    var charCountEl, errorsSpacer;

    // Wait until the next tick to ensure that the input has setup the errors spacer where we will
    // append our counter
    $mdUtil.nextTick(function() {
      errorsSpacer = angular.element(containerCtrl.element[0].querySelector('.md-errors-spacer'));
      charCountEl = angular.element('<div class="md-char-counter">');

      // Append our character counter inside the errors spacer
      errorsSpacer.append(charCountEl);

      // Stop model from trimming. This makes it so whitespace
      // over the maxlength still counts as invalid.
      attr.$set('ngTrim', 'false');

      ngModelCtrl.$formatters.push(renderCharCount);
      ngModelCtrl.$viewChangeListeners.push(renderCharCount);
      element.on('input keydown keyup', function() {
        renderCharCount(); //make sure it's called with no args
      });

      scope.$watch(attr.mdMaxlength, function(value) {
        maxlength = value;
        if (angular.isNumber(value) && value > 0) {
          if (!charCountEl.parent().length) {
            $animate.enter(charCountEl, errorsSpacer);
          }
          renderCharCount();
        } else {
          $animate.leave(charCountEl);
        }
      });

      ngModelCtrl.$validators['md-maxlength'] = function(modelValue, viewValue) {
        if (!angular.isNumber(maxlength) || maxlength < 0) {
          return true;
        }
        return ( modelValue || element.val() || viewValue || '' ).length <= maxlength;
      };
    });

    function renderCharCount(value) {
      // If we have not been appended to the body yet; do not render
      if (!charCountEl.parent) {
        return value;
      }

      // Force the value into a string since it may be a number,
      // which does not have a length property.
      charCountEl.text(String(element.val() || value || '').length + '/' + maxlength);
      return value;
    }
  }
}

function placeholderDirective($log) {
  return {
    restrict: 'A',
    require: '^^?mdInputContainer',
    priority: 200,
    link: postLink
  };

  function postLink(scope, element, attr, inputContainer) {
    // If there is no input container, just return
    if (!inputContainer) return;

    var label = inputContainer.element.find('label');
    var hasNoFloat = angular.isDefined(inputContainer.element.attr('md-no-float'));

    // If we have a label, or they specify the md-no-float attribute, just return
    if ((label && label.length) || hasNoFloat) {
      // Add a placeholder class so we can target it in the CSS
      inputContainer.setHasPlaceholder(true);
      return;
    }

    // Otherwise, grab/remove the placeholder
    var placeholderText = attr.placeholder;
    element.removeAttr('placeholder');

    // And add the placeholder text as a separate label
    if (inputContainer.input && inputContainer.input[0].nodeName != 'MD-SELECT') {
      var placeholder = '<label ng-click="delegateClick()">' + placeholderText + '</label>';

      inputContainer.element.addClass('md-icon-float');
      inputContainer.element.prepend(placeholder);
    }
  }
}

function mdSelectOnFocusDirective() {

  return {
    restrict: 'A',
    link: postLink
  };

  function postLink(scope, element, attr) {
    if (element[0].nodeName !== 'INPUT' && element[0].nodeName !== "TEXTAREA") return;

    element.on('focus', onFocus);

    scope.$on('$destroy', function() {
      element.off('focus', onFocus);
    });

    function onFocus() {
      // Use HTMLInputElement#select to fix firefox select issues
      element[0].select();
    }
  }
}

var visibilityDirectives = ['ngIf', 'ngShow', 'ngHide', 'ngSwitchWhen', 'ngSwitchDefault'];
function ngMessagesDirective() {
  return {
    restrict: 'EA',
    link: postLink,

    // This is optional because we don't want target *all* ngMessage instances, just those inside of
    // mdInputContainer.
    require: '^^?mdInputContainer'
  };

  function postLink(scope, element, attrs, inputContainer) {
    // If we are not a child of an input container, don't do anything
    if (!inputContainer) return;

    // Add our animation class
    element.toggleClass('md-input-messages-animation', true);

    // Add our md-auto-hide class to automatically hide/show messages when container is invalid
    element.toggleClass('md-auto-hide', true);

    // If we see some known visibility directives, remove the md-auto-hide class
    if (attrs.mdAutoHide == 'false' || hasVisibiltyDirective(attrs)) {
      element.toggleClass('md-auto-hide', false);
    }
  }

  function hasVisibiltyDirective(attrs) {
    return visibilityDirectives.some(function(attr) {
      return attrs[attr];
    });
  }
}

function ngMessageDirective($mdUtil) {
  return {
    restrict: 'EA',
    compile: compile,
    priority: 100
  };

  function compile(element) {
    var inputContainer = $mdUtil.getClosest(element, "md-input-container");

    // If we are not a child of an input container, don't do anything
    if (!inputContainer) return;

    // Add our animation class
    element.toggleClass('md-input-message-animation', true);

    return {};
  }
}

function mdInputInvalidMessagesAnimation($q, $animateCss) {
  return {
    addClass: function(element, className, done) {
      var messages = getMessagesElement(element);

      if (className == "md-input-invalid" && messages.hasClass('md-auto-hide')) {
        showInputMessages(element, $animateCss, $q).finally(done);
      } else {
        done();
      }
    }

    // NOTE: We do not need the removeClass method, because the message ng-leave animation will fire
  }
}

function ngMessagesAnimation($q, $animateCss) {
  return {
    enter: function(element, done) {
      showInputMessages(element, $animateCss, $q).finally(done);
    },

    leave: function(element, done) {
      hideInputMessages(element, $animateCss, $q).finally(done);
    },

    addClass: function(element, className, done) {
      if (className == "ng-hide") {
        hideInputMessages(element, $animateCss, $q).finally(done);
      } else {
        done();
      }
    },

    removeClass: function(element, className, done) {
      if (className == "ng-hide") {
        showInputMessages(element, $animateCss, $q).finally(done);
      } else {
        done();
      }
    }
  }
}

function ngMessageAnimation($animateCss) {
  return {
    enter: function(element, done) {
      var messages = getMessagesElement(element);

      // If we have the md-auto-hide class, the md-input-invalid animation will fire, so we can skip
      if (messages.hasClass('md-auto-hide')) {
        done();
        return;
      }

      return showMessage(element, $animateCss);
    },

    leave: function(element, done) {
      return hideMessage(element, $animateCss);
    }
  }
}

function showInputMessages(element, $animateCss, $q) {
  var animators = [], animator;
  var messages = getMessagesElement(element);

  angular.forEach(messages.children(), function(child) {
    animator = showMessage(angular.element(child), $animateCss);

    animators.push(animator.start());
  });

  return $q.all(animators);
}

function hideInputMessages(element, $animateCss, $q) {
  var animators = [], animator;
  var messages = getMessagesElement(element);

  angular.forEach(messages.children(), function(child) {
    animator = hideMessage(angular.element(child), $animateCss);

    animators.push(animator.start());
  });

  return $q.all(animators);
}

function showMessage(element, $animateCss) {
  var height = element[0].offsetHeight;

  return $animateCss(element, {
    event: 'enter',
    structural: true,
    from: {"opacity": 0, "margin-top": -height + "px"},
    to: {"opacity": 1, "margin-top": "0"},
    duration: 0.3
  });
}

function hideMessage(element, $animateCss) {
  var height = element[0].offsetHeight;
  var styles = window.getComputedStyle(element[0]);

  // If we are already hidden, just return an empty animation
  if (styles.opacity == 0) {
    return $animateCss(element, {});
  }

  // Otherwise, animate
  return $animateCss(element, {
    event: 'leave',
    structural: true,
    from: {"opacity": 1, "margin-top": 0},
    to: {"opacity": 0, "margin-top": -height + "px"},
    duration: 0.3
  });
}

function getInputElement(element) {
  var inputContainer = element.controller('mdInputContainer');

  return inputContainer.element;
}

function getMessagesElement(element) {
  var input = getInputElement(element);
  var selector = 'ng-messages,data-ng-messages,x-ng-messages,' +
    '[ng-messages],[data-ng-messages],[x-ng-messages]';

  return angular.element(input[0].querySelector(selector));
}
