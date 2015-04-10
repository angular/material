(function() {
'use strict';
/**
 * @ngdoc module
 * @name material.components.select
 */

/***************************************************

### TODO ###
**DOCUMENTATION AND DEMOS**

- [ ] ng-model with child mdOptions (basic)
- [ ] ng-model="foo" ng-model-options="{ trackBy: '$value.id' }" for objects
- [ ] mdOption with value
- [ ] Usage with input inside

### TODO - POST RC1 ###
- [ ] Abstract placement logic in $mdSelect service to $mdMenu service

***************************************************/

var SELECT_EDGE_MARGIN = 8;
var selectNextId = 0;

angular.module('material.components.select', [
  'material.core',
  'material.components.backdrop'
])
.directive('mdSelect', SelectDirective)
.directive('mdSelectMenu', SelectMenuDirective)
.directive('mdOption', OptionDirective)
.directive('mdOptgroup', OptgroupDirective)
.provider('$mdSelect', SelectProvider);


/**
 * @ngdoc directive
 * @name mdSelect
 * @restrict E
 * @module material.components.select
 *
 * @description Displays a select box, bound to an ng-model.
 *
 * @param {expression} ng-model The model!
 * @param {boolean=} multiple Whether it's multiple.
 * @param {string=} placeholder Placeholder hint text.
 *
 * @usage
 * With a placeholder (label is added dynamically)
 * <hljs lang="html">
 *   <md-select
 *     ng-model="someModel"
 *     placeholder="Select a state">
 *     <md-option ng-value="opt" ng-repeat="opt in neighborhoods2">{{ opt }}</md-option>
 *   </md-select>
 * </hljs>
 *
 * With an explicit label
 * <hljs lang="html">
 *   <md-select
 *     ng-model="someModel">
 *     <md-select-label>Select a state</md-select-label>
 *     <md-option ng-value="opt" ng-repeat="opt in neighborhoods2">{{ opt }}</md-option>
 *   </md-select>
 * </hljs>
 */
function SelectDirective($mdSelect, $mdUtil, $mdTheming, $interpolate, $compile, $parse) {
  var intStart = $interpolate.startSymbol();
  var intEnd = $interpolate.endSymbol();

  return {
    restrict: 'E',
    require: ['mdSelect', 'ngModel', '?^form'],
    compile: compile,
    controller: function() { } // empty placeholder controller to be initialized in link
  };

  function compile(element, attr) {
    // The user is allowed to provide a label for the select as md-select-label child
    var labelEl = element.find('md-select-label').remove();

    // If not provided, we automatically make one
    if (!labelEl.length) {
      labelEl = angular.element('<md-select-label><span></span></md-select-label>');
    } else {
      if (!labelEl[0].firstElementChild) {
        var spanWrapper = angular.element('<span>');
        spanWrapper.append(labelEl.contents());
        labelEl.append(spanWrapper);
      }
    }
    labelEl.append('<span class="md-select-icon" aria-hidden="true"></span>');
    labelEl.addClass('md-select-label');
    labelEl.attr('id', 'select_label_' + $mdUtil.nextUid());

    // There's got to be an md-content inside. If there's not one, let's add it.
    if (!element.find('md-content').length) {
      element.append( angular.element('<md-content>').append(element.contents()) );
    }

    // Add progress spinner for md-options-loading
    if (attr.mdOnOpen) {
      element.find('md-content').prepend(
        angular.element('<md-progress-circular>')
               .attr('md-mode', 'indeterminate')
               .attr('ng-hide', '$$loadingAsyncDone')
               .wrap('<div>')
               .parent()
      );
    }

    if (attr.name) {
      var autofillClone = angular.element('<select class="md-visually-hidden">');
      autofillClone.attr({
        'name': '.' + attr.name,
        'ng-model': attr.ngModel,
        'aria-hidden': 'true',
        'tabindex': '-1'
      });
      var opts = element.find('md-option');
      angular.forEach(opts, function(el) {
        var newEl = angular.element('<option>' + el.innerHTML + '</option>');
        if (el.hasAttribute('ng-value')) newEl.attr('ng-value', el.getAttribute('ng-value'));
        else if (el.hasAttribute('value')) newEl.attr('value', el.getAttribute('value'));
        autofillClone.append(newEl);
      });

      element.parent().append(autofillClone);
    }

    // Use everything that's left inside element.contents() as the contents of the menu
    var selectTemplate = '<div class="md-select-menu-container">' +
        '<md-select-menu ' +
        (angular.isDefined(attr.multiple) ? 'multiple' : '') + '>' +
          element.html() +
        '</md-select-menu></div>';

    element.empty().append(labelEl);

    $mdTheming(element);

    return function postLink(scope, element, attr, ctrls) {
      var isOpen;
      var isDisabled;

      var mdSelectCtrl = ctrls[0];
      var ngModel = ctrls[1];
      var formCtrl = ctrls[2];

      var labelEl = element.find('md-select-label');
      var customLabel = labelEl.text().length !== 0;
      var selectContainer, selectScope, selectMenuCtrl;
      createSelect();

      if (attr.name && formCtrl) {
        var selectEl = element.parent()[0].querySelector('select[name=".' + attr.name + '"]')
        formCtrl.$removeControl(angular.element(selectEl).controller());
      }

      var originalRender = ngModel.$render;
      ngModel.$render = function() {
        originalRender();
        syncLabelText();
      };

      var lineHeight;
      mdSelectCtrl.setLabelText = function(text) {
        if (customLabel) return; // Assume that user is handling it on their own
        mdSelectCtrl.setIsPlaceholder(!text);
        var newText = text || attr.placeholder || '';
        var target = customLabel ? labelEl : labelEl.children().eq(0);

        if (lineHeight === undefined) {
          target.text('M');
          lineHeight = target[0].offsetHeight;
        }

        var doneShrinking = false;
        var didShrink = false;
        do {
          target.text(newText);
          if (target[0].offsetHeight > lineHeight) {
            newText = newText.slice(0, -1);
            didShrink = true;
          } else {
            if (didShrink == true) {
              newText = newText.slice(0, -3) + '...';
              target.text(newText);
            }
            doneShrinking = true;
          }
        } while (!doneShrinking);
      };

      mdSelectCtrl.setIsPlaceholder = function(val) {
        val ? labelEl.addClass('md-placeholder') : labelEl.removeClass('md-placeholder');
      };

      scope.$$postDigest(syncLabelText);

      var selectMenuCtrl;
      function syncLabelText() {
        if (selectContainer) {
          selectMenuCtrl = selectMenuCtrl || selectContainer.find('md-select-menu').controller('mdSelectMenu');
          mdSelectCtrl.setLabelText(selectMenuCtrl.selectedLabels());
        }
      }

      var deregisterWatcher;
      attr.$observe('ngMultiple', function(val) {
        if (deregisterWatcher) deregisterWatcher();
        var parser = $parse(val);
        deregisterWatcher = scope.$watch(function() { return parser(scope); }, function(multiple, prevVal) {
          if (multiple === undefined && prevVal === undefined) return; // assume compiler did a good job
          if (multiple) {
            element.attr('multiple', 'multiple');
          } else {
            element.removeAttr('multiple');
          }
          if (selectContainer) {
            selectMenuCtrl.setMultiple(multiple);
            originalRender = ngModel.$render;
            ngModel.$render = function() {
              originalRender();
              syncLabelText();
            };
            selectMenuCtrl.refreshViewValue();
            ngModel.$render();
          }
        });
      });

      attr.$observe('disabled', function(disabled) {
        if (typeof disabled == "string") {
          disabled = true;
        }
        // Prevent click event being registered twice
        if (isDisabled !== undefined && isDisabled === disabled) {
          return;
        }
        isDisabled = disabled;
        if (disabled) {
          element.attr('tabindex', -1);
          element.off('click', openSelect);
          element.off('keydown', handleKeypress);
        } else {
          element.attr('tabindex', 0);
          element.on('click', openSelect);
          element.on('keydown', handleKeypress);
        }
      });
      if (!attr.disabled && !attr.ngDisabled) {
        element.attr('tabindex', 0);
        element.on('click', openSelect);
        element.on('keydown', handleKeypress);
      }

      element.attr({
        'role': 'combobox',
        'id': 'select_' + $mdUtil.nextUid(),
        'aria-haspopup': true,
        'aria-expanded': 'false',
        'aria-labelledby': labelEl.attr('id')
      });

      scope.$on('$destroy', function() {
        if (isOpen) {
          $mdSelect.cancel().then(function() {
            selectContainer.remove();
          });
        } else {
          selectContainer.remove();
        }
      });


      // Create a fake select to find out the label value
      function createSelect() {
        selectContainer = angular.element(selectTemplate);
        var selectEl = selectContainer.find('md-select-menu');
        selectEl.data('$ngModelController', ngModel);
        selectEl.data('$mdSelectController', mdSelectCtrl);
        selectScope = scope.$new();
        selectContainer = $compile(selectContainer)(selectScope);
        selectMenuCtrl = selectContainer.find('md-select-menu').controller('mdSelectMenu');
      }

      function handleKeypress(e) {
        var allowedCodes = [32, 13, 38, 40];
        if (allowedCodes.indexOf(e.keyCode) != -1 ) {
          // prevent page scrolling on interaction
          e.preventDefault();
          openSelect(e);
        } else {
          if (e.keyCode <= 90 && e.keyCode >= 31) {
            e.preventDefault();
            var node = selectMenuCtrl.optNodeForKeyboardSearch(e);
            if (!node) return;
            var optionCtrl = angular.element(node).controller('mdOption');
            if (!selectMenuCtrl.isMultiple) {
              selectMenuCtrl.deselect( Object.keys(selectMenuCtrl.selected)[0] );
            }
            selectMenuCtrl.select(optionCtrl.hashKey, optionCtrl.value);
            selectMenuCtrl.refreshViewValue();
            ngModel.$render();
          }
        }
      }

      function openSelect() {
        scope.$evalAsync(function() {
          isOpen = true;
          $mdSelect.show({
            scope: selectScope,
            preserveScope: true,
            skipCompile: true,
            element: selectContainer,
            target: element[0],
            hasBackdrop: true,
            loadingAsync: attr.mdOnOpen ? scope.$eval(attr.mdOnOpen) || true : false,
          }).then(function(selectedText) {
            isOpen = false;
          });
        });
      }
    };
  }
}

function SelectMenuDirective($parse, $mdUtil, $mdTheming) {

  return {
    restrict: 'E',
    require: ['mdSelectMenu', '?ngModel'],
    controller: SelectMenuController,
    link: { pre: preLink }
  };

  // We use preLink instead of postLink to ensure that the select is initialized before
  // its child options run postLink.
  function preLink(scope, element, attr, ctrls) {
    var selectCtrl = ctrls[0];
    var ngModel = ctrls[1];

    $mdTheming(element);
    element.on('click', clickListener);
    element.on('keypress', keyListener);
    if (ngModel) selectCtrl.init(ngModel);
    configureAria();

    function configureAria() {
      element.attr({
        'id': 'select_menu_' + $mdUtil.nextUid(),
        'role': 'listbox',
        'aria-multiselectable': (selectCtrl.isMultiple ? 'true' : 'false')
      });
    }

    function keyListener(e) {
      if (e.keyCode == 13 || e.keyCode == 32) {
        clickListener(e);
      }
    }

    function clickListener(ev) {
      var option = $mdUtil.getClosest(ev.target, 'md-option');
      var optionCtrl = option && angular.element(option).data('$mdOptionController');
      if (!option || !optionCtrl) return;

      var optionHashKey = selectCtrl.hashGetter(optionCtrl.value);
      var isSelected = angular.isDefined(selectCtrl.selected[optionHashKey]);

      scope.$apply(function() {
        if (selectCtrl.isMultiple) {
          if (isSelected) {
            selectCtrl.deselect(optionHashKey);
          } else {
            selectCtrl.select(optionHashKey, optionCtrl.value);
          }
        } else {
          if (!isSelected) {
            selectCtrl.deselect( Object.keys(selectCtrl.selected)[0] );
            selectCtrl.select( optionHashKey, optionCtrl.value );
          }
        }
        selectCtrl.refreshViewValue();
      });
    }
  }



  function SelectMenuController($scope, $attrs, $element) {
    var self = this;
    self.isMultiple = angular.isDefined($attrs.multiple);
    // selected is an object with keys matching all of the selected options' hashed values
    self.selected = {};
    // options is an object with keys matching every option's hash value,
    // and values matching every option's controller.
    self.options = {};

    var deregisterCollectionWatch;
    self.setMultiple = function(isMultiple) {
      var ngModel = self.ngModel;
      self.isMultiple = isMultiple;
      if (deregisterCollectionWatch) deregisterCollectionWatch();

      if (self.isMultiple) {
        ngModel.$validators['md-multiple'] = validateArray;
        ngModel.$render = renderMultiple;

        // watchCollection on the model because by default ngModel only watches the model's
        // reference. This allowed the developer to also push and pop from their array.
        $scope.$watchCollection($attrs.ngModel, function(value) {
          if (validateArray(value)) renderMultiple(value);
        });
      } else {
        delete ngModel.$validators['md-multiple'];
        ngModel.$render = renderSingular;
      }

      function validateArray(modelValue, viewValue) {
        // If a value is truthy but not an array, reject it.
        // If value is undefined/falsy, accept that it's an empty array.
        return angular.isArray(modelValue || viewValue || []);
      }
    };

    var searchStr = '';
    var clearSearchTimeout, optNodes, optText;
    var CLEAR_SEARCH_AFTER = 300;
    self.optNodeForKeyboardSearch = function(e) {
      clearSearchTimeout && clearTimeout(clearSearchTimeout);
      clearSearchTimeout = setTimeout(function() {
        clearSearchTimeout = undefined;
        searchStr = '';
        optText = undefined;
        optNodes = undefined;
      }, CLEAR_SEARCH_AFTER);
      searchStr += String.fromCharCode(e.keyCode);
      var search = new RegExp('^' + searchStr, 'i');
      if (!optNodes) {
        optNodes = $element.find('md-option');
        optText = new Array(optNodes.length);
        angular.forEach(optNodes, function(el, i) {
          optText[i] = el.textContent;
        });
      }
      for (var i = 0; i < optText.length; ++i) {
        if (search.test(optText[i])) {
          return optNodes[i];
        }
      }
    };


    self.init = function(ngModel) {
      self.ngModel = ngModel;

      // Allow users to provide `ng-model="foo" ng-model-options="{trackBy: 'foo.id'}"` so
      // that we can properly compare objects set on the model to the available options
      if (ngModel.$options && ngModel.$options.trackBy) {
        var trackByLocals = {};
        var trackByParsed = $parse(ngModel.$options.trackBy);
        self.hashGetter = function(value, valueScope) {
          trackByLocals.$value = value;
          return trackByParsed(valueScope || $scope, trackByLocals);
        };
      // If the user doesn't provide a trackBy, we automatically generate an id for every
      // value passed in
      } else {
        self.hashGetter = function getHashValue(value) {
          if (angular.isObject(value)) {
            return '$$object_' + (value.$$mdSelectId || (value.$$mdSelectId = ++selectNextId));
          }
          return value;
        };
      }
      self.setMultiple(self.isMultiple);
    };

    self.selectedLabels = function() {
      var selectedOptionEls = nodesToArray($element[0].querySelectorAll('md-option[selected]'));
      if (selectedOptionEls.length) {
        return selectedOptionEls.map(function(el) { return el.textContent; }).join(', ');
      } else {
        return '';
      }
    };

    self.select = function(hashKey, hashedValue) {
      var option = self.options[hashKey];
      option && option.setSelected(true);
      self.selected[hashKey] = hashedValue;
    };
    self.deselect = function(hashKey) {
      var option = self.options[hashKey];
      option && option.setSelected(false);
      delete self.selected[hashKey];
    };

    self.addOption = function(hashKey, optionCtrl) {
      if (angular.isDefined(self.options[hashKey])) {
        throw new Error('Duplicate md-option values are not allowed in a select. ' +
                        'Duplicate value "' + optionCtrl.value + '" found.');
      }
      self.options[hashKey] = optionCtrl;

      // If this option's value was already in our ngModel, go ahead and select it.
      if (angular.isDefined(self.selected[hashKey])) {
        self.select(hashKey, optionCtrl.value);
        self.refreshViewValue();
      }
    };
    self.removeOption = function(hashKey) {
      delete self.options[hashKey];
      // Don't deselect an option when it's removed - the user's ngModel should be allowed
      // to have values that do not match a currently available option.
    };

    self.refreshViewValue = function() {
      var values = [];
      var option;
      for (var hashKey in self.selected) {
         // If this hashKey has an associated option, push that option's value to the model.
         if ((option = self.options[hashKey])) {
           values.push(option.value);
         } else {
           // Otherwise, the given hashKey has no associated option, and we got it
           // from an ngModel value at an earlier time. Push the unhashed value of
           // this hashKey to the model.
           // This allows the developer to put a value in the model that doesn't yet have
           // an associated option.
           values.push(self.selected[hashKey]);
         }
      }
      self.ngModel.$setViewValue(self.isMultiple ? values : values[0]);
    };

    function renderMultiple() {
      var newSelectedValues = self.ngModel.$modelValue || self.ngModel.$viewValue;
      if (!angular.isArray(newSelectedValues)) return;

      var oldSelected = Object.keys(self.selected);

      var newSelectedHashes = newSelectedValues.map(self.hashGetter);
      var deselected = oldSelected.filter(function(hash) {
        return newSelectedHashes.indexOf(hash) === -1;
      });

      deselected.forEach(self.deselect);
      newSelectedHashes.forEach(function(hashKey, i) {
        self.select(hashKey, newSelectedValues[i]);
      });
    }
    function renderSingular() {
      var value = self.ngModel.$viewValue || self.ngModel.$modelValue;
      Object.keys(self.selected).forEach(self.deselect);
      self.select( self.hashGetter(value), value );
    }
  }

}

function OptionDirective($mdInkRipple, $mdUtil) {

  return {
    restrict: 'E',
    require: ['mdOption', '^^mdSelectMenu'],
    controller: OptionController,
    compile: compile
  };

  function compile(element, attr) {
    // Manual transclusion to avoid the extra inner <span> that ng-transclude generates
    element.append( angular.element('<div class="md-text">').append(element.contents()) );
    if (attr.tabindex === undefined) element.attr('tabindex', 0);
    return postLink;
  }

  function postLink(scope, element, attr, ctrls) {
    var optionCtrl = ctrls[0];
    var selectCtrl = ctrls[1];

    if (angular.isDefined(attr.ngValue)) {
      scope.$watch(attr.ngValue, setOptionValue);
    } else if (angular.isDefined(attr.value)) {
      setOptionValue(attr.value);
    } else {
      scope.$watch(function() { return element.text(); }, setOptionValue)
    }

    scope.$$postDigest(function() {
      attr.$observe('selected', function(selected) {
        if (!angular.isDefined(selected)) return;
        if (selected) {
          if (!selectCtrl.isMultiple) {
            selectCtrl.deselect( Object.keys(selectCtrl.selected)[0] );
          }
          selectCtrl.select(optionCtrl.hashKey, optionCtrl.value);
        } else {
          selectCtrl.deselect(optionCtrl.hashKey);
        }
        selectCtrl.refreshViewValue();
        selectCtrl.ngModel.$render();
      });
    });

    $mdInkRipple.attachButtonBehavior(scope, element);
    configureAria();

    function setOptionValue(newValue, oldValue) {
      var oldHashKey = selectCtrl.hashGetter(oldValue, scope);
      var newHashKey = selectCtrl.hashGetter(newValue, scope);

      optionCtrl.hashKey = newHashKey;
      optionCtrl.value = newValue;

      selectCtrl.removeOption(oldHashKey, optionCtrl);
      selectCtrl.addOption(newHashKey, optionCtrl);
    }

    scope.$on('$destroy', function() {
      selectCtrl.removeOption(optionCtrl.hashKey, optionCtrl);
    });

    function configureAria() {
      element.attr({
        'role': 'option',
        'aria-selected': 'false',
        'id': 'select_option_'+ $mdUtil.nextUid()
      });
    }
  }

  function OptionController($element) {
    this.selected = false;
    this.setSelected = function(isSelected) {
      if (isSelected && !this.selected) {
        $element.attr({
          'selected': 'selected',
          'aria-selected': 'true'
        });
      } else if (!isSelected && this.selected) {
        $element.removeAttr('selected');
        $element.attr('aria-selected', 'false');
      }
      this.selected = isSelected;
    };
  }

}

function OptgroupDirective() {
  return {
    restrict: 'E',
    compile: compile
  };
  function compile(el, attrs) {
    var labelElement = el.find('label');
    if (!labelElement.length) {
      labelElement = angular.element('<label>');
      el.prepend(labelElement);
    }
    if (attrs.label) labelElement.text(attrs.label);
  }
}

function SelectProvider($$interimElementProvider) {
  return $$interimElementProvider('$mdSelect')
    .setDefaults({
      methods: ['target'],
      options: selectDefaultOptions
    });

  /* @ngInject */
  function selectDefaultOptions($mdSelect, $mdConstant, $$rAF, $mdUtil, $mdTheming, $timeout, $window) {
    return {
      parent: 'body',
      onShow: onShow,
      onRemove: onRemove,
      hasBackdrop: true,
      disableParentScroll: $mdUtil.floatingScrollbars(),
      themable: true
    };

    function onShow(scope, element, opts) {
      if (!opts.target) {
        throw new Error('$mdSelect.show() expected a target element in options.target but got ' +
                        '"' + opts.target + '"!');
      }

      angular.extend(opts, {
        isRemoved: false,
        target: angular.element(opts.target), //make sure it's not a naked dom node
        parent: angular.element(opts.parent),
        selectEl: element.find('md-select-menu'),
        contentEl: element.find('md-content'),
        backdrop: opts.hasBackdrop && angular.element('<md-backdrop class="md-select-backdrop md-click-catcher">')
      });

      opts.resizeFn = function() {
        animateSelect(scope, element, opts);
      };

      angular.element($window).on('resize', opts.resizeFn);
      angular.element($window).on('orientationchange', opts.resizeFn);


      configureAria();

      element.removeClass('md-leave');

      var optionNodes = opts.selectEl[0].getElementsByTagName('md-option');

      if (opts.loadingAsync && opts.loadingAsync.then) {
        opts.loadingAsync.then(function() {
          scope.$$loadingAsyncDone = true;
          // Give ourselves two frames for the progress loader to clear out.
          $$rAF(function() {
            $$rAF(function() {
              // Don't go forward if the select has been removed in this time...
              if (opts.isRemoved) return;
              animateSelect(scope, element, opts);
            });
          });
        });
      } else if (opts.loadingAsync) {
        scope.$$loadingAsyncDone = true;
      }

      if (opts.disableParentScroll) {
        opts.disableTarget = opts.parent.find('md-content');
        if (!opts.disableTarget.length) opts.disableTarget = opts.parent;
        if ($mdUtil.floatingScrollbars()) {
          opts.disableTarget.css('margin-right', '16px');
        }
        opts.lastOverflow = opts.disableTarget.css('overflow');
        opts.disableTarget.css('overflow', 'hidden');
      }
      // Only activate click listeners after a short time to stop accidental double taps/clicks
      // from clicking the wrong item
      $timeout(activateInteraction, 75, false);

      if (opts.backdrop) {
        $mdTheming.inherit(opts.backdrop, opts.parent);
        opts.parent.append(opts.backdrop);
      }
      opts.parent.append(element);

      // Give the select a frame to 'initialize' in the DOM,
      // so we can read its height/width/position
      $$rAF(function() {
        $$rAF(function() {
          if (opts.isRemoved) return;
          animateSelect(scope, element, opts);
        });
      });

      return $mdUtil.transitionEndPromise(opts.selectEl, {timeout: 350});

      function configureAria() {
        opts.selectEl.attr('aria-labelledby', opts.target.attr('id'));
        opts.target.attr('aria-owns', opts.selectEl.attr('id'));
        opts.target.attr('aria-expanded', 'true');
      }

      function activateInteraction() {
        if (opts.isRemoved) return;
        var selectCtrl = opts.selectEl.controller('mdSelectMenu') || {};
        element.addClass('md-clickable');

        opts.backdrop && opts.backdrop.on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          opts.restoreFocus = false;
          scope.$apply($mdSelect.cancel);
        });

        // Escape to close
        opts.selectEl.on('keydown', function(ev) {
          switch (ev.keyCode) {
            case $mdConstant.KEY_CODE.SPACE:
            case $mdConstant.KEY_CODE.ENTER:
              var option = $mdUtil.getClosest(ev.target, 'md-option');
              if (option) {
                opts.selectEl.triggerHandler({
                  type: 'click',
                  target: option
                });
                ev.preventDefault();
              }
              break;
            case $mdConstant.KEY_CODE.TAB:
            case $mdConstant.KEY_CODE.ESCAPE:
              ev.preventDefault();
              opts.restoreFocus = true;
              scope.$apply($mdSelect.cancel);
          }
        });

        // Cycling of options, and closing on enter
        opts.selectEl.on('keydown', function(ev) {
          switch (ev.keyCode) {
            case $mdConstant.KEY_CODE.UP_ARROW: return focusPrevOption();
            case $mdConstant.KEY_CODE.DOWN_ARROW: return focusNextOption();
            default:
              if (ev.keyCode >= 31 && ev.keyCode <= 90) {
                var optNode = opts.selectEl.controller('mdSelectMenu').optNodeForKeyboardSearch(ev);
                optNode && optNode.focus();
              }
          }
        });


        function focusOption(direction) {
          var optionsArray = nodesToArray(optionNodes);
          var index = optionsArray.indexOf(opts.focusedNode);
          if (index === -1) {
            // We lost the previously focused element, reset to first option
            index = 0;
          } else if (direction === 'next' && index < optionsArray.length - 1) {
            index++;
          } else if (direction === 'prev' && index > 0) {
            index--;
          }
          var newOption = opts.focusedNode = optionsArray[index];
          newOption && newOption.focus();
        }
        function focusNextOption() {
          focusOption('next');
        }
        function focusPrevOption() {
          focusOption('prev');
        }

        opts.selectEl.on('click', checkCloseMenu);
        opts.selectEl.on('keydown', function(e) {
          if (e.keyCode == 32 || e.keyCode == 13) {
            checkCloseMenu();
          }
        });

        function checkCloseMenu() {
          if (!selectCtrl.isMultiple) {
            opts.restoreFocus = true;
            scope.$evalAsync(function() {
              $mdSelect.hide(selectCtrl.ngModel.$viewValue);
            });
          }
        }
      }

    }

    function onRemove(scope, element, opts) {
      opts.isRemoved = true;
      element.addClass('md-leave')
        .removeClass('md-clickable');
      opts.target.attr('aria-expanded', 'false');

      if (opts.disableParentScroll && $mdUtil.floatingScrollbars()) {
        opts.disableTarget.css('overflow', opts.lastOverflow);
        opts.disableTarget.css('margin-right', '0px');
        delete opts.lastOverflow;
        delete opts.disableTarget;
      }

      angular.element($window).off('resize', opts.resizefn);
      angular.element($window).off('orientationchange', opts.resizefn);
      opts.resizeFn = undefined;

      var mdSelect = opts.selectEl.controller('mdSelect');
      if (mdSelect) {
        mdSelect.setLabelText(opts.selectEl.controller('mdSelectMenu').selectedLabels());
      }

      return $mdUtil.transitionEndPromise(element, { timeout: 350 }).then(function() {
        element.removeClass('md-active');
        opts.parent[0].removeChild(element[0]); // use browser to avoid $destroy event
        opts.backdrop && opts.backdrop.remove();
        if (opts.restoreFocus) opts.target.focus();
      });
    }

    function animateSelect(scope, element, opts) {
      var containerNode = element[0],
          targetNode = opts.target[0],
          parentNode = opts.parent[0],
          selectNode = opts.selectEl[0],
          contentNode = opts.contentEl[0],
          parentRect = parentNode.getBoundingClientRect(),
          targetRect = targetNode.getBoundingClientRect(),
          shouldOpenAroundTarget = false,
          bounds = {
            left: parentRect.left + SELECT_EDGE_MARGIN,
            top: SELECT_EDGE_MARGIN,
            bottom: parentRect.height - SELECT_EDGE_MARGIN,
            right: parentRect.width - SELECT_EDGE_MARGIN - ($mdUtil.floatingScrollbars() ? 16 : 0)
          },
          spaceAvailable = {
            top: targetRect.top - bounds.top,
            left: targetRect.left - bounds.left,
            right: bounds.right - (targetRect.left + targetRect.width),
            bottom: bounds.bottom - (targetRect.top + targetRect.height)
          },
          maxWidth = parentRect.width - SELECT_EDGE_MARGIN * 2,
          isScrollable = contentNode.scrollHeight > contentNode.offsetHeight,
          selectedNode = selectNode.querySelector('md-option[selected]'),
          optionNodes = selectNode.getElementsByTagName('md-option'),
          optgroupNodes = selectNode.getElementsByTagName('md-optgroup');


      var centeredNode;
      // If a selected node, center around that
      if (selectedNode) {
        centeredNode = selectedNode;
      // If there are option groups, center around the first option group
      } else if (optgroupNodes.length) {
        centeredNode = optgroupNodes[0];
      // Otherwise, center around the first optionNode
      } else if (optionNodes.length){
        centeredNode = optionNodes[0];
      // In case there are no options, center on whatever's in there... (eg progress indicator)
      } else {
        centeredNode = contentNode.firstElementChild || contentNode;
      }

      if (contentNode.offsetWidth > maxWidth) {
        contentNode.style['max-width'] = maxWidth + 'px';
      }
      if (shouldOpenAroundTarget) {
        contentNode.style['min-width'] = targetRect.width + 'px';
      }

      // Remove padding before we compute the position of the menu
      if (isScrollable) {
        selectNode.classList.add('md-overflow');
      }

      // Get the selectMenuRect *after* max-width is possibly set above
      var selectMenuRect = selectNode.getBoundingClientRect();
      var centeredRect = getOffsetRect(centeredNode);

      if (centeredNode) {
        var centeredStyle = window.getComputedStyle(centeredNode);
        centeredRect.paddingLeft = parseInt(centeredStyle.paddingLeft, 10) || 0;
        centeredRect.paddingRight = parseInt(centeredStyle.paddingRight, 10) || 0;
      }

      var focusedNode = centeredNode;
      if ((focusedNode.tagName || '').toUpperCase() === 'MD-OPTGROUP') {
        focusedNode = optionNodes[0] || contentNode.firstElementChild || contentNode;
      }

      if (isScrollable) {
        var scrollBuffer = contentNode.offsetHeight / 2;
        contentNode.scrollTop = centeredRect.top + centeredRect.height / 2 - scrollBuffer;

        if (spaceAvailable.top < scrollBuffer) {
          contentNode.scrollTop = Math.min(
            centeredRect.top,
            contentNode.scrollTop + scrollBuffer - spaceAvailable.top
          );
        } else if (spaceAvailable.bottom < scrollBuffer) {
          contentNode.scrollTop = Math.max(
            centeredRect.top + centeredRect.height - selectMenuRect.height,
            contentNode.scrollTop - scrollBuffer + spaceAvailable.bottom
          );
        }
      }

      var left, top, transformOrigin;
      if (shouldOpenAroundTarget) {
        left = targetRect.left;
        top = targetRect.top + targetRect.height;
        transformOrigin = '50% 0';
        if (top + selectMenuRect.height > bounds.bottom) {
          top = targetRect.top - selectMenuRect.height;
          transformOrigin = '50% 100%';
        }
      } else {
        left = targetRect.left + centeredRect.left - centeredRect.paddingLeft;
        top = targetRect.top + targetRect.height / 2 - centeredRect.height / 2 -
          centeredRect.top + contentNode.scrollTop;

        transformOrigin = (centeredRect.left + targetRect.width / 2) + 'px ' +
        (centeredRect.top + centeredRect.height / 2 - contentNode.scrollTop) + 'px 0px';

        containerNode.style.minWidth = targetRect.width + centeredRect.paddingLeft +
          centeredRect.paddingRight + 'px';
      }

      // Keep left and top within the window
      var containerRect = containerNode.getBoundingClientRect();
      containerNode.style.left = clamp(bounds.left, left, bounds.right - containerRect.width) + 'px';
      containerNode.style.top = clamp(bounds.top, top, bounds.bottom - containerRect.height) + 'px';
      selectNode.style[$mdConstant.CSS.TRANSFORM_ORIGIN] = transformOrigin;

      selectNode.style[$mdConstant.CSS.TRANSFORM] = 'scale(' +
        Math.min(targetRect.width / selectMenuRect.width, 1.0) + ',' +
        Math.min(targetRect.height / selectMenuRect.height, 1.0) +
      ')';


      $$rAF(function() {
        element.addClass('md-active');
        selectNode.style[$mdConstant.CSS.TRANSFORM] = '';
        if (focusedNode) {
          opts.focusedNode = focusedNode;
          focusedNode.focus();
        }
      });
    }

  }

  function clamp(min, n, max) {
    return Math.max(min, Math.min(n, max));
  }

  function getOffsetRect(node) {
    return node ? {
      left: node.offsetLeft,
      top: node.offsetTop,
      width: node.offsetWidth,
      height: node.offsetHeight
    } : { left: 0, top: 0, width: 0, height: 0 };
  }
}

// Annoying method to copy nodes to an array, thanks to IE
function nodesToArray(nodes) {
  var results = [];
  for (var i = 0; i < nodes.length; ++i) {
    results.push(nodes.item(i));
  }
  return results;
}
})();

