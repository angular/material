/**
 * @ngdoc module
 * @name material.components.select
 */

/***************************************************

 ### TODO ###
 - [ ] Abstract placement logic in $mdSelect service to $mdMenu service

 ***************************************************/

var SELECT_EDGE_MARGIN = 8;
var selectNextId = 0;
var CHECKBOX_SELECTION_INDICATOR =
  angular.element('<div class="md-container"><div class="md-icon"></div></div>');

angular.module('material.components.select', [
    'material.core',
    'material.components.backdrop'
  ])
  .directive('mdSelect', SelectDirective)
  .directive('mdSelectMenu', SelectMenuDirective)
  .directive('mdOption', OptionDirective)
  .directive('mdOptgroup', OptgroupDirective)
  .directive('mdSelectHeader', SelectHeaderDirective)
  .provider('$mdSelect', SelectProvider);

/**
 * @ngdoc directive
 * @name mdSelect
 * @restrict E
 * @module material.components.select
 *
 * @description Displays a select box, bound to an `ng-model`. Selectable options are defined using
 * the <a ng-href="api/directive/mdOption">md-option</a> element directive. Options can be grouped
 * using the <a ng-href="api/directive/mdOptgroup">md-optgroup</a> element directive.
 *
 * When the select is required and uses a floating label, then the label will automatically contain
 * an asterisk (`*`). This behavior can be disabled by using the `md-no-asterisk` attribute.
 *
 * By default, the select will display with an underline to match other form elements. This can be
 * disabled by applying the `md-no-underline` CSS class.
 *
 * @param {expression} ng-model Assignable angular expression to data-bind to.
 * @param {expression=} ng-change Expression to be executed when the model value changes.
 * @param {boolean=} multiple When present, allows for more than one option to be selected.
 *  The model is an array with the selected choices. **Note:** This attribute is only evaluated
 *  once; it is not watched.
 * @param {expression=} md-on-close Expression to be evaluated when the select is closed.
 * @param {expression=} md-on-open Expression to be evaluated when opening the select.
 *  Will hide the select options and show a spinner until the evaluated promise resolves.
 * @param {expression=} md-selected-text Expression to be evaluated that will return a string
 *  to be displayed as a placeholder in the select input box when it is closed. The value
 *  will be treated as *text* (not html).
 * @param {expression=} md-selected-html Expression to be evaluated that will return a string
 *  to be displayed as a placeholder in the select input box when it is closed. The value
 *  will be treated as *html*. The value must either be explicitly marked as trustedHtml or
 *  the ngSanitize module must be loaded.
 * @param {string=} placeholder Placeholder hint text.
 * @param {boolean=} md-no-asterisk When set to true, an asterisk will not be appended to the
 *  floating label. **Note:** This attribute is only evaluated once; it is not watched.
 * @param {string=} aria-label Optional label for accessibility. Only necessary if no explicit label
 *  is present.
 * @param {string=} md-container-class Class list to get applied to the `.md-select-menu-container`
 *  element (for custom styling).
 * @param {string=} md-select-only-option If specified, a `<md-select>` will automatically select
 * it's first option, if it only has one.
 *
 * @usage
 * With a placeholder (label and aria-label are added dynamically)
 * <hljs lang="html">
 *   <md-input-container>
 *     <md-select
 *       ng-model="someModel"
 *       placeholder="Select a state">
 *       <md-option ng-value="opt" ng-repeat="opt in neighborhoods2">{{ opt }}</md-option>
 *     </md-select>
 *   </md-input-container>
 * </hljs>
 *
 * With an explicit label
 * <hljs lang="html">
 *   <md-input-container>
 *     <label>State</label>
 *     <md-select
 *       ng-model="someModel">
 *       <md-option ng-value="opt" ng-repeat="opt in neighborhoods2">{{ opt }}</md-option>
 *     </md-select>
 *   </md-input-container>
 * </hljs>
 *
 * Using the `md-select-header` element directive
 *
 * When a developer needs to put more than just a text label in the `md-select-menu`, they should
 * use one or more `md-select-header`s. These elements can contain custom HTML which can be styled
 * as desired. Use cases for this element include a sticky search bar and custom option group
 * labels.
 *
 * <hljs lang="html">
 *   <md-input-container>
 *     <md-select ng-model="someModel">
 *       <md-select-header>
 *         <span> Neighborhoods - </span>
 *       </md-select-header>
 *       <md-option ng-value="opt" ng-repeat="opt in neighborhoods2">{{ opt }}</md-option>
 *     </md-select>
 *   </md-input-container>
 * </hljs>
 *
 * ## Selects and object equality
 * When using a `md-select` to pick from a list of objects, it is important to realize how javascript handles
 * equality. Consider the following example:
 * <hljs lang="js">
 * angular.controller('MyCtrl', function($scope) {
 *   $scope.users = [
 *     { id: 1, name: 'Bob' },
 *     { id: 2, name: 'Alice' },
 *     { id: 3, name: 'Steve' }
 *   ];
 *   $scope.selectedUser = { id: 1, name: 'Bob' };
 * });
 * </hljs>
 * <hljs lang="html">
 * <div ng-controller="MyCtrl">
 *   <md-select ng-model="selectedUser">
 *     <md-option ng-value="user" ng-repeat="user in users">{{ user.name }}</md-option>
 *   </md-select>
 * </div>
 * </hljs>
 *
 * At first one might expect that the select should be populated with "Bob" as the selected user.
 * However, this is not true. To determine whether something is selected,
 * `ngModelController` is looking at whether `$scope.selectedUser == (any user in $scope.users);`;
 *
 * Javascript's `==` operator does not check for deep equality (ie. that all properties
 * on the object are the same), but instead whether the objects are *the same object in memory*.
 * In this case, we have two instances of identical objects, but they exist in memory as unique
 * entities. Because of this, the select will have no value populated for a selected user.
 *
 * To get around this, `ngModelController` provides a `track by` option that allows us to specify a
 * different expression which will be used for the equality operator. As such, we can update our
 * `html` to make use of this by specifying the `ng-model-options="{trackBy: '$value.id'}"` on the
 * `md-select` element. This converts our equality expression to be
 * `$scope.selectedUser.id == (any id in $scope.users.map(function(u) { return u.id; }));`
 * which results in Bob being selected as desired.
 *
 * **Note:** We do not support AngularJS's `track by` syntax. For instance
 *  `ng-options="user in users track by user.id"` will not work with `md-select`.
 *
 * Working HTML:
 * <hljs lang="html">
 * <div ng-controller="MyCtrl">
 *   <md-select ng-model="selectedUser" ng-model-options="{trackBy: '$value.id'}">
 *     <md-option ng-value="user" ng-repeat="user in users">{{ user.name }}</md-option>
 *   </md-select>
 * </div>
 * </hljs>
 */
function SelectDirective($mdSelect, $mdUtil, $mdConstant, $mdTheming, $mdAria, $parse, $sce) {
  return {
    restrict: 'E',
    require: ['^?mdInputContainer', 'mdSelect', 'ngModel', '?^form'],
    compile: compile,
    controller: function() {
    } // empty placeholder controller to be initialized in link
  };

  /**
   * @param {JQLite} tElement
   * @param {IAttributes} tAttrs
   * @return {postLink}
   */
  function compile(tElement, tAttrs) {
    var isMultiple = $mdUtil.parseAttributeBoolean(tAttrs.multiple);
    tElement.addClass('md-auto-horizontal-margin');

    // add the select value that will hold our placeholder or selected option value
    var valueEl = angular.element('<md-select-value><span></span></md-select-value>');
    valueEl.append('<span class="md-select-icon" aria-hidden="true"></span>');
    valueEl.addClass('md-select-value');
    if (!valueEl[0].hasAttribute('id')) {
      valueEl.attr('id', 'select_value_label_' + $mdUtil.nextUid());
    }

    // There's got to be an md-content inside. If there's not one, let's add it.
    var mdContentEl = tElement.find('md-content');
    if (!mdContentEl.length) {
      tElement.append(angular.element('<md-content>').append(tElement.contents()));
      mdContentEl = tElement.find('md-content');
    }
    mdContentEl.attr('role', 'listbox');
    mdContentEl.attr('tabindex', '-1');

    if (isMultiple) {
      mdContentEl.attr('aria-multiselectable', 'true');
    } else {
      mdContentEl.attr('aria-multiselectable', 'false');
    }

    // Add progress spinner for md-options-loading
    if (tAttrs.mdOnOpen) {

      // Show progress indicator while loading async
      // Use ng-hide for `display:none` so the indicator does not interfere with the options list
      tElement
        .find('md-content')
        .prepend(angular.element(
          '<div>' +
          ' <md-progress-circular md-mode="indeterminate" ng-if="$$loadingAsyncDone === false"' +
          ' md-diameter="25px"></md-progress-circular>' +
          '</div>'
        ));

      // Hide list [of item options] while loading async
      tElement
        .find('md-option')
        .attr('ng-show', '$$loadingAsyncDone');
    }

    if (tAttrs.name) {
      var autofillClone = angular.element('<select class="md-visually-hidden"></select>');
      autofillClone.attr({
        'name': tAttrs.name,
        'aria-hidden': 'true',
        'tabindex': '-1'
      });
      var opts = tElement.find('md-option');
      angular.forEach(opts, function(el) {
        var newEl = angular.element('<option>' + el.innerHTML + '</option>');
        if (el.hasAttribute('ng-value')) {
          newEl.attr('ng-value', el.getAttribute('ng-value'));
        }
        else if (el.hasAttribute('value')) {
          newEl.attr('value', el.getAttribute('value'));
        }
        autofillClone.append(newEl);
      });

      // Adds an extra option that will hold the selected value for the
      // cases where the select is a part of a non-AngularJS form. This can be done with a ng-model,
      // however if the `md-option` is being `ng-repeat`-ed, AngularJS seems to insert a similar
      // `option` node, but with a value of `? string: <value> ?` which would then get submitted.
      // This also goes around having to prepend a dot to the name attribute.
      autofillClone.append(
        '<option ng-value="' + tAttrs.ngModel + '" selected></option>'
      );

      tElement.parent().append(autofillClone);
    }

    // Use everything that's left inside element.contents() as the contents of the menu
    var multipleContent = isMultiple ? 'multiple' : '';
    var ngModelOptions = tAttrs.ngModelOptions ? $mdUtil.supplant('ng-model-options="{0}"', [tAttrs.ngModelOptions]) : '';
    var selectTemplate = '' +
      '<div class="md-select-menu-container" aria-hidden="true" role="presentation">' +
      '  <md-select-menu role="presentation" {0} {1}>{2}</md-select-menu>' +
      '</div>';

    selectTemplate = $mdUtil.supplant(selectTemplate, [multipleContent, ngModelOptions,  tElement.html()]);
    tElement.empty().append(valueEl);
    tElement.append(selectTemplate);

    if (!tAttrs.tabindex) {
      tAttrs.$set('tabindex', 0);
    }

    return function postLink(scope, element, attrs, ctrls) {
      var untouched = true;
      var isDisabled;

      var containerCtrl = ctrls[0];
      var mdSelectCtrl = ctrls[1];
      var ngModelCtrl = ctrls[2];
      var formCtrl = ctrls[3];
      // grab a reference to the select menu value label
      var selectValueElement = element.find('md-select-value');
      var isReadonly = angular.isDefined(attrs.readonly);
      var disableAsterisk = $mdUtil.parseAttributeBoolean(attrs.mdNoAsterisk);
      var stopMdMultipleWatch;
      var userDefinedLabelledby = angular.isDefined(attrs.ariaLabelledby);
      var listboxContentElement = element.find('md-content');
      var initialPlaceholder = element.attr('placeholder');

      if (disableAsterisk) {
        element.addClass('md-no-asterisk');
      }

      if (containerCtrl) {
        var isErrorGetter = containerCtrl.isErrorGetter || function() {
          return ngModelCtrl.$invalid && (ngModelCtrl.$touched || (formCtrl && formCtrl.$submitted));
        };

        if (containerCtrl.input) {
          // We ignore inputs that are in the md-select-header.
          // One case where this might be useful would be adding as searchbox.
          if (element.find('md-select-header').find('input')[0] !== containerCtrl.input[0]) {
            throw new Error("<md-input-container> can only have *one* child <input>, <textarea>, or <select> element!");
          }
        }

        containerCtrl.input = element;
        if (!containerCtrl.label) {
          $mdAria.expect(element, 'aria-label', initialPlaceholder);
          var selectLabel = element.attr('aria-label');
          if (!selectLabel) {
            selectLabel = initialPlaceholder;
          }
          listboxContentElement.attr('aria-label', selectLabel);
        } else {
          containerCtrl.label.attr('aria-hidden', 'true');
          listboxContentElement.attr('aria-label', containerCtrl.label.text());
          containerCtrl.setHasPlaceholder(!!initialPlaceholder);
        }

        var stopInvalidWatch = scope.$watch(isErrorGetter, containerCtrl.setInvalid);
      }

      var selectContainer, selectScope, selectMenuCtrl;

      selectContainer = findSelectContainer();
      $mdTheming(element);

      var originalRender = ngModelCtrl.$render;
      ngModelCtrl.$render = function() {
        originalRender();
        syncSelectValueText();
        inputCheckValue();
      };

      var stopPlaceholderObserver = attrs.$observe('placeholder', ngModelCtrl.$render);

      var stopRequiredObserver = attrs.$observe('required', function (value) {
        if (containerCtrl && containerCtrl.label) {
          // Toggle the md-required class on the input containers label, because the input container
          // is automatically applying the asterisk indicator on the label.
          containerCtrl.label.toggleClass('md-required', value && !disableAsterisk);
        }
        element.removeAttr('aria-required');
        if (value) {
          listboxContentElement.attr('aria-required', 'true');
        } else {
          listboxContentElement.removeAttr('aria-required');
        }
      });

      /**
       * Set the contents of the md-select-value element. This element's contents are announced by
       * screen readers and used for displaying the value of the select in both single and multiple
       * selection modes.
       * @param {string=} text A sanitized and trusted HTML string or a pure text string from user
       *  input.
       */
      mdSelectCtrl.setSelectValueText = function(text) {
        var useDefaultText = text === undefined || text === '';
        // Whether the select label has been given via user content rather than the internal
        // template of <md-option>
        var isSelectLabelFromUser = false;

        mdSelectCtrl.setIsPlaceholder(!text);

        if (attrs.mdSelectedText && attrs.mdSelectedHtml) {
          throw Error('md-select cannot have both `md-selected-text` and `md-selected-html`');
        }

        if (attrs.mdSelectedText || attrs.mdSelectedHtml) {
          text = $parse(attrs.mdSelectedText || attrs.mdSelectedHtml)(scope);
          isSelectLabelFromUser = true;
        } else if (useDefaultText) {
          // Use placeholder attribute, otherwise fallback to the md-input-container label
          var tmpPlaceholder = attrs.placeholder ||
              (containerCtrl && containerCtrl.label ? containerCtrl.label.text() : '');

          text = tmpPlaceholder || '';
          isSelectLabelFromUser = true;
        }

        var target = selectValueElement.children().eq(0);

        if (attrs.mdSelectedHtml) {
          // Using getTrustedHtml will run the content through $sanitize if it is not already
          // explicitly trusted. If the ngSanitize module is not loaded, this will
          // *correctly* throw an sce error.
          target.html($sce.getTrustedHtml(text));
        } else if (isSelectLabelFromUser) {
          target.text(text);
        } else {
          // If we've reached this point, the text is not user-provided.
          target.html(text);
        }

        if (useDefaultText) {
          // Avoid screen readers double announcing the label name when no value has been selected
          selectValueElement.attr('aria-hidden', 'true');
          if (!userDefinedLabelledby) {
            element.removeAttr('aria-labelledby');
          }
        } else {
          selectValueElement.removeAttr('aria-hidden');
          if (!userDefinedLabelledby) {
            element.attr('aria-labelledby', element[0].id + ' ' + selectValueElement[0].id);
          }
        }
      };

      /**
       * @param {boolean} isPlaceholder true to mark the md-select-value element and
       *  input container, if one exists, with classes for styling when a placeholder is present.
       *  false to remove those classes.
       */
      mdSelectCtrl.setIsPlaceholder = function(isPlaceholder) {
          if (isPlaceholder) {
            selectValueElement.addClass('md-select-placeholder');
            // Don't hide the floating label if the md-select has a placeholder.
            if (containerCtrl && containerCtrl.label && !element.attr('placeholder')) {
              containerCtrl.label.addClass('md-placeholder');
            }
          } else {
            selectValueElement.removeClass('md-select-placeholder');
            if (containerCtrl && containerCtrl.label && !element.attr('placeholder')) {
              containerCtrl.label.removeClass('md-placeholder');
            }
          }
      };

      if (!isReadonly) {
        var handleBlur = function(event) {
          // Attach before ngModel's blur listener to stop propagation of blur event
          // and prevent setting $touched.
          if (untouched) {
            untouched = false;
            if (selectScope._mdSelectIsOpen) {
              event.stopImmediatePropagation();
            }
          }

          containerCtrl && containerCtrl.setFocused(false);
          inputCheckValue();
        };
        var handleFocus = function() {
          // Always focus the container (if we have one) so floating labels and other styles are
          // applied properly
          containerCtrl && containerCtrl.setFocused(true);
        };

        element.on('focus', handleFocus);
        element.on('blur', handleBlur);
      }

      mdSelectCtrl.triggerClose = function() {
        $parse(attrs.mdOnClose)(scope);
      };

      scope.$$postDigest(function() {
        initAriaLabel();
        syncSelectValueText();
      });

      function initAriaLabel() {
        var labelText = element.attr('aria-label') || element.attr('placeholder');
        if (!labelText && containerCtrl && containerCtrl.label) {
          labelText = containerCtrl.label.text();
        }
        $mdAria.expect(element, 'aria-label', labelText);
      }

      var stopSelectedLabelsWatcher = scope.$watch(function() {
        return selectMenuCtrl.getSelectedLabels();
      }, syncSelectValueText);

      function syncSelectValueText() {
        selectMenuCtrl = selectMenuCtrl ||
          selectContainer.find('md-select-menu').controller('mdSelectMenu');
        mdSelectCtrl.setSelectValueText(selectMenuCtrl.getSelectedLabels());
      }

      // TODO add tests for mdMultiple
      // TODO add docs for mdMultiple
      var stopMdMultipleObserver = attrs.$observe('mdMultiple', function(val) {
        if (stopMdMultipleWatch) {
          stopMdMultipleWatch();
        }
        var parser = $parse(val);
        stopMdMultipleWatch = scope.$watch(function() {
          return parser(scope);
        }, function(multiple, prevVal) {
          var selectMenu = selectContainer.find('md-select-menu');
          // assume compiler did a good job
          if (multiple === undefined && prevVal === undefined) {
            return;
          }
          if (multiple) {
            var setMultipleAttrs = {'multiple': 'multiple'};
            element.attr(setMultipleAttrs);
            selectMenu.attr(setMultipleAttrs);
          } else {
            element.removeAttr('multiple');
            selectMenu.removeAttr('multiple');
          }
          element.find('md-content').attr('aria-multiselectable', multiple ? 'true' : 'false');

          if (selectContainer) {
            selectMenuCtrl.setMultiple(Boolean(multiple));
            originalRender = ngModelCtrl.$render;
            ngModelCtrl.$render = function() {
              originalRender();
              syncSelectValueText();
              inputCheckValue();
            };
            ngModelCtrl.$render();
          }
        });
      });

      var stopDisabledObserver = attrs.$observe('disabled', function(disabled) {
        if (angular.isString(disabled)) {
          disabled = true;
        }
        // Prevent click event being registered twice
        if (isDisabled !== undefined && isDisabled === disabled) {
          return;
        }
        isDisabled = disabled;
        if (disabled) {
          element
            .attr({'aria-disabled': 'true'})
            .removeAttr('tabindex')
            .removeAttr('aria-expanded')
            .removeAttr('aria-haspopup')
            .off('click', openSelect)
            .off('keydown', handleKeypress);
        } else {
          element
            .attr({
              'tabindex': attrs.tabindex,
              'aria-haspopup': 'listbox'
            })
            .removeAttr('aria-disabled')
            .on('click', openSelect)
            .on('keydown', handleKeypress);
        }
      });

      if (!attrs.hasOwnProperty('disabled') && !attrs.hasOwnProperty('ngDisabled')) {
        element.attr({'aria-disabled': 'false'});
        element.on('click', openSelect);
        element.on('keydown', handleKeypress);
      }

      var ariaAttrs = {
        role: 'button',
        'aria-haspopup': 'listbox'
      };

      if (!element[0].hasAttribute('id')) {
        ariaAttrs.id = 'select_' + $mdUtil.nextUid();
      }

      var containerId = 'select_container_' + $mdUtil.nextUid();
      selectContainer.attr('id', containerId);
      var listboxContentId = 'select_listbox_' + $mdUtil.nextUid();
      selectContainer.find('md-content').attr('id', listboxContentId);
      // Only add aria-owns if element ownership is NOT represented in the DOM.
      if (!element.find('md-select-menu').length) {
        ariaAttrs['aria-owns'] = listboxContentId;
      }
      element.attr(ariaAttrs);

      scope.$on('$destroy', function() {
        stopRequiredObserver && stopRequiredObserver();
        stopDisabledObserver && stopDisabledObserver();
        stopMdMultipleWatch && stopMdMultipleWatch();
        stopMdMultipleObserver && stopMdMultipleObserver();
        stopSelectedLabelsWatcher && stopSelectedLabelsWatcher();
        stopPlaceholderObserver && stopPlaceholderObserver();
        stopInvalidWatch && stopInvalidWatch();

        element.off('focus');
        element.off('blur');

        $mdSelect
          .destroy()
          .finally(function() {
            if (containerCtrl) {
              containerCtrl.setFocused(false);
              containerCtrl.setHasValue(false);
              containerCtrl.input = null;
            }
            ngModelCtrl.$setTouched();
          });
      });

      function inputCheckValue() {
        // The select counts as having a value if one or more options are selected,
        // or if the input's validity state says it has bad input (eg: string in a number input).
        // We must do this on nextTick as the $render is sometimes invoked on nextTick.
        $mdUtil.nextTick(function () {
          containerCtrl && containerCtrl.setHasValue(
            selectMenuCtrl.getSelectedLabels().length > 0 || (element[0].validity || {}).badInput);
        });
      }

      function findSelectContainer() {
        var selectContainer = angular.element(
          element[0].querySelector('.md-select-menu-container')
        );
        selectScope = scope;
        attrs.mdContainerClass && selectContainer.addClass(attrs.mdContainerClass);
        selectMenuCtrl = selectContainer.find('md-select-menu').controller('mdSelectMenu');
        selectMenuCtrl.init(ngModelCtrl, attrs);
        element.on('$destroy', function() {
          selectContainer.remove();
        });
        return selectContainer;
      }

      /**
       * Determine if the select menu should be opened or an option in the select menu should be
       * selected.
       * @param {KeyboardEvent} e keyboard event to handle
       */
      function handleKeypress(e) {
        if ($mdConstant.isNavigationKey(e)) {
          // prevent page scrolling on interaction
          e.preventDefault();
          openSelect(e);
        } else {
          if (shouldHandleKey(e, $mdConstant)) {
            e.preventDefault();

            var node = selectMenuCtrl.optNodeForKeyboardSearch(e);
            if (!node || node.hasAttribute('disabled')) {
              return;
            }
            var optionCtrl = angular.element(node).controller('mdOption');
            if (!selectMenuCtrl.isMultiple) {
              angular.forEach(Object.keys(selectMenuCtrl.selected), function (key) {
                selectMenuCtrl.deselect(key);
              });
            }
            selectMenuCtrl.select(optionCtrl.hashKey, optionCtrl.value);
            selectMenuCtrl.refreshViewValue();
          }
        }
      }

      function openSelect() {
        selectScope._mdSelectIsOpen = true;
        element.attr('aria-expanded', 'true');

        $mdSelect.show({
          scope: selectScope,
          preserveScope: true,
          skipCompile: true,
          element: selectContainer,
          target: element[0],
          selectCtrl: mdSelectCtrl,
          preserveElement: true,
          hasBackdrop: true,
          loadingAsync: attrs.mdOnOpen ? scope.$eval(attrs.mdOnOpen) || true : false
        }).finally(function() {
          selectScope._mdSelectIsOpen = false;
          element.removeAttr('aria-expanded');
          element.removeAttr('aria-activedescendant');
          ngModelCtrl.$setTouched();
        });
      }

    };
  }
}

function SelectMenuDirective($parse, $mdUtil, $mdConstant, $mdTheming) {
  // We want the scope to be set to 'false' so an isolated scope is not created
  // which would interfere with the md-select-header's access to the
  // parent scope.
  return {
    restrict: 'E',
    require: ['mdSelectMenu'],
    scope: false,
    controller: SelectMenuController,
    link: {pre: preLink}
  };

  // We use preLink instead of postLink to ensure that the select is initialized before
  // its child options run postLink.
  function preLink(scope, element, attrs, ctrls) {
    var selectMenuCtrl = ctrls[0];

    element.addClass('_md');     // private md component indicator for styling

    $mdTheming(element);
    element.on('click', clickListener);
    element.on('keypress', keyListener);

    /**
     * @param {KeyboardEvent} keyboardEvent
     */
    function keyListener(keyboardEvent) {
      if (keyboardEvent.keyCode === 13 || keyboardEvent.keyCode === 32) {
        clickListener(keyboardEvent);
      }
    }

    /**
     * @param {Event} mouseEvent
     * @return {void}
     */
    function clickListener(mouseEvent) {
      var option = $mdUtil.getClosest(mouseEvent.target, 'md-option');
      var optionCtrl = option && angular.element(option).data('$mdOptionController');

      if (!option || !optionCtrl) {
        // Avoid closing the menu when the select header's input is clicked
        if (mouseEvent.target && mouseEvent.target.parentNode &&
          mouseEvent.target.parentNode.tagName === 'MD-SELECT-HEADER') {
          mouseEvent.stopImmediatePropagation();
        }
        return;
      } else if (option.hasAttribute('disabled')) {
        mouseEvent.stopImmediatePropagation();
        return;
      }

      var optionHashKey = selectMenuCtrl.hashGetter(optionCtrl.value);
      var isSelected = angular.isDefined(selectMenuCtrl.selected[optionHashKey]);

      scope.$apply(function() {
        if (selectMenuCtrl.isMultiple) {
          if (isSelected) {
            selectMenuCtrl.deselect(optionHashKey);
          } else {
            selectMenuCtrl.select(optionHashKey, optionCtrl.value);
          }
        } else {
          if (!isSelected) {
            angular.forEach(Object.keys(selectMenuCtrl.selected), function (key) {
              selectMenuCtrl.deselect(key);
            });
            selectMenuCtrl.select(optionHashKey, optionCtrl.value);
          }
        }
        selectMenuCtrl.refreshViewValue();
      });
    }
  }

  function SelectMenuController($scope, $attrs, $element) {
    var self = this;
    var defaultIsEmpty;
    var searchStr = '';
    var clearSearchTimeout, optNodes, optText;
    var CLEAR_SEARCH_AFTER = 300;

    self.isMultiple = angular.isDefined($attrs.multiple);
    // selected is an object with keys matching all of the selected options' hashed values
    self.selected = {};
    // options is an object with keys matching every option's hash value,
    // and values containing an instance of every option's controller.
    self.options = {};

    $scope.$watchCollection(function() {
      return self.options;
    }, function() {
      self.ngModel.$render();
      updateOptionSetSizeAndPosition();
    });

    /**
     * @param {boolean} isMultiple
     */
    self.setMultiple = function(isMultiple) {
      var ngModel = self.ngModel;
      defaultIsEmpty = defaultIsEmpty || ngModel.$isEmpty;
      self.isMultiple = isMultiple;

      if (self.isMultiple) {
        // We want to delay the render method so that the directive has a chance to load before
        // rendering, this prevents the control being marked as dirty onload.
        var loaded = false;
        var delayedRender = function(val) {
          if (!loaded) {
            $mdUtil.nextTick(function () {
              renderMultiple(val);
              loaded = true;
            });
          } else {
            renderMultiple(val);
          }
        };
        ngModel.$validators['md-multiple'] = validateArray;
        ngModel.$render = delayedRender;

        // watchCollection on the model because by default ngModel only watches the model's
        // reference. This allows the developer to also push and pop from their array.
        $scope.$watchCollection(self.modelBinding, function(value) {
          if (validateArray(value)) {
            delayedRender(value);
          }
        });

        ngModel.$isEmpty = function(value) {
          return !value || value.length === 0;
        };
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

    /**
     * @param {KeyboardEvent} keyboardEvent keyboard event to handle
     * @return {Element|HTMLElement|undefined}
     */
    self.optNodeForKeyboardSearch = function(keyboardEvent) {
      var search, i;
      clearSearchTimeout && clearTimeout(clearSearchTimeout);
      clearSearchTimeout = setTimeout(function() {
        clearSearchTimeout = undefined;
        searchStr = '';
        optText = undefined;
        optNodes = undefined;
      }, CLEAR_SEARCH_AFTER);

      searchStr += keyboardEvent.key;
      search = new RegExp('^' + $mdUtil.sanitize(searchStr), 'i');
      if (!optNodes) {
        optNodes = $element.find('md-option');
        optText = new Array(optNodes.length);
        angular.forEach(optNodes, function(el, i) {
          optText[i] = el.textContent.trim();
        });
      }

      for (i = 0; i < optText.length; ++i) {
        if (search.test(optText[i])) {
          return optNodes[i];
        }
      }
    };

    self.init = function(ngModel, parentAttrs) {
      self.ngModel = ngModel;
      self.modelBinding = parentAttrs.ngModel;

      // Setup a more robust version of isEmpty to ensure value is a valid option
      self.ngModel.$isEmpty = function($viewValue) {
        // We have to transform the viewValue into the hashKey, because otherwise the
        // OptionCtrl may not exist. Developers may have specified a trackBy function.
        var hashedValue = self.options[self.hashGetter($viewValue)] ? self.options[self.hashGetter($viewValue)].value : null;
        // Base this check on the default AngularJS $isEmpty() function.
        // eslint-disable-next-line no-self-compare
        return !angular.isDefined(hashedValue) || hashedValue === null || hashedValue === '' || hashedValue !== hashedValue;
      };

      // Allow users to provide `ng-model="foo" ng-model-options="{trackBy: '$value.id'}"` so
      // that we can properly compare objects set on the model to the available options
      //
      // If the user doesn't provide a trackBy, we automatically generate an id for every
      // value passed in with the getId function
      if ($attrs.ngModelOptions) {
        self.hashGetter = function(value) {
          var ngModelOptions = $parse($attrs.ngModelOptions)($scope);
          var trackByOption = ngModelOptions && ngModelOptions.trackBy;

          if (trackByOption) {
            return $parse(trackByOption)($scope, { $value: value });
          } else if (angular.isObject(value)) {
            return getId(value);
          }
          return value;
        };
      } else {
        self.hashGetter = getId;
      }
      self.setMultiple(self.isMultiple);

      /**
       * If the value is an object, get the unique, incremental id of the value.
       * If it's not an object, the value will be converted to a string and then returned.
       * @param value
       * @returns {string}
       */
      function getId(value) {
        if (angular.isObject(value) && !angular.isArray(value)) {
          return 'object_' + (value.$$mdSelectId || (value.$$mdSelectId = ++selectNextId));
        }
        return value + '';
      }

      if (parentAttrs.hasOwnProperty('mdSelectOnlyOption')) {
        $mdUtil.nextTick(function() {
          var optionKeys = Object.keys(self.options);

          if (optionKeys.length === 1) {
            var option = self.options[optionKeys[0]];

            self.deselect(Object.keys(self.selected)[0]);
            self.select(self.hashGetter(option.value), option.value);
            self.refreshViewValue();
            self.ngModel.$setPristine();
          }
        }, false);
      }
    };

    /**
     * @param {string=} id
     */
    self.setActiveDescendant = function(id) {
      if (angular.isDefined(id)) {
        $element.find('md-content').attr('aria-activedescendant', id);
      } else {
        $element.find('md-content').removeAttr('aria-activedescendant');
      }
    };

    /**
     * @param {{mode: string}=} opts options object to allow specifying html (default) or aria mode.
     * @return {string} comma separated set of selected values
     */
    self.getSelectedLabels = function(opts) {
      opts = opts || {};
      var mode = opts.mode || 'html';
      var selectedOptionEls =
        $mdUtil.nodesToArray($element[0].querySelectorAll('md-option[selected]'));

      if (selectedOptionEls.length) {
        var mapFn;

        if (mode === 'html') {
          // Map the given element to its innerHTML string. If the element has a child ripple
          // container remove it from the HTML string, before returning the string.
          mapFn = function(el) {
            // If we do not have a `value` or `ng-value`, assume it is an empty option which clears
            // the select.
            if (el.hasAttribute('md-option-empty')) {
              return '';
            }

            var html = el.innerHTML;

            // Remove the ripple container from the selected option, copying it would cause a CSP
            // violation.
            var rippleContainer = el.querySelector('.md-ripple-container');
            if (rippleContainer) {
              html = html.replace(rippleContainer.outerHTML, '');
            }

            // Remove the checkbox container, because it will cause the label to wrap inside of the
            // placeholder. It should be not displayed inside of the label element.
            var checkboxContainer = el.querySelector('.md-container');
            if (checkboxContainer) {
              html = html.replace(checkboxContainer.outerHTML, '');
            }

            return html;
          };
        } else if (mode === 'aria') {
          mapFn = function(el) {
            return el.hasAttribute('aria-label') ? el.getAttribute('aria-label') : el.textContent;
          };
        }

        // Ensure there are no duplicates; see https://github.com/angular/material/issues/9442
        return $mdUtil.uniq(selectedOptionEls.map(mapFn)).join(', ');
      } else {
        return '';
      }
    };

    /**
     * Mark an option as selected
     * @param {string} hashKey key within the SelectMenuController.options object, which is an
     *  instance of OptionController.
     * @param {OptionController} hashedValue value to associate with the key
     */
    self.select = function(hashKey, hashedValue) {
      var option = self.options[hashKey];
      option && option.setSelected(true, self.isMultiple);
      self.selected[hashKey] = hashedValue;
    };

    /**
     * Mark an option as not selected
     * @param {string} hashKey key within the SelectMenuController.options object, which is an
     *  instance of OptionController.
     */
    self.deselect = function(hashKey) {
      var option = self.options[hashKey];
      option && option.setSelected(false, self.isMultiple);
      delete self.selected[hashKey];
    };

    /**
     * Add an option to the select
     * @param {string} hashKey key within the SelectMenuController.options object, which is an
     *  instance of OptionController.
     * @param {OptionController} optionCtrl instance to associate with the key
     */
    self.addOption = function(hashKey, optionCtrl) {
      if (angular.isDefined(self.options[hashKey])) {
        throw new Error('Duplicate md-option values are not allowed in a select. ' +
          'Duplicate value "' + optionCtrl.value + '" found.');
      }

      self.options[hashKey] = optionCtrl;

      // If this option's value was already in our ngModel, go ahead and select it.
      if (angular.isDefined(self.selected[hashKey])) {
        self.select(hashKey, optionCtrl.value);

        // When the current $modelValue of the ngModel Controller is using the same hash as
        // the current option, which will be added, then we can be sure, that the validation
        // of the option has occurred before the option was added properly.
        // This means, that we have to manually trigger a new validation of the current option.
        if (angular.isDefined(self.ngModel.$$rawModelValue) &&
            self.hashGetter(self.ngModel.$$rawModelValue) === hashKey) {
          self.ngModel.$validate();
        }

        self.refreshViewValue();
      }
    };

    /**
     * Remove an option from the select
     * @param {string} hashKey key within the SelectMenuController.options object, which is an
     *  instance of OptionController.
     */
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

      var newVal = self.isMultiple ? values : values[0];
      var prevVal = self.ngModel.$modelValue;

      if (!equals(prevVal, newVal)) {
        self.ngModel.$setViewValue(newVal);
        self.ngModel.$render();
      }

      function equals(prevVal, newVal) {
        if (self.isMultiple) {
          if (!angular.isArray(prevVal)) {
            // newVal is always an array when self.isMultiple is true
            // thus, if prevVal is not an array they are different
            return false;
          } else if (prevVal.length !== newVal.length) {
            // they are different if they have different length
            return false;
          } else {
            // if they have the same length, then they are different
            // if an item in the newVal array can't be found in the prevVal
            var prevValHashes = prevVal.map(function(prevValItem) {
              return self.hashGetter(prevValItem);
            });
            return newVal.every(function(newValItem) {
              var newValItemHash = self.hashGetter(newValItem);
              return prevValHashes.some(function(prevValHash) {
                return prevValHash === newValItemHash;
              });
            });
          }
        } else {
          return self.hashGetter(prevVal) === self.hashGetter(newVal);
        }
      }
    };

    /**
     * If the options include md-optgroups, then we need to apply aria-setsize and aria-posinset
     * to help screen readers understand the indexes. When md-optgroups are not used, we save on
     * perf and extra attributes by not applying these attributes as they are not needed by screen
     * readers.
     */
    function updateOptionSetSizeAndPosition() {
      var i, options;
      var hasOptGroup = $element.find('md-optgroup');
      if (!hasOptGroup.length) {
        return;
      }

      options = $element.find('md-option');

      for (i = 0; i < options.length; i++) {
        options[i].setAttribute('aria-setsize', options.length);
        options[i].setAttribute('aria-posinset', i + 1);
      }
    }

    function renderMultiple() {
      var newSelectedValues = self.ngModel.$modelValue || self.ngModel.$viewValue || [];
      if (!angular.isArray(newSelectedValues)) {
        return;
      }

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
      self.select(self.hashGetter(value), value);
    }
  }
}

/**
 * @ngdoc directive
 * @name mdOption
 * @restrict E
 * @module material.components.select
 *
 * @description Displays an option in a <a ng-href="api/directive/mdSelect">md-select</a> box's
 * dropdown menu. Options can be grouped using
 * <a ng-href="api/directive/mdOptgroup">md-optgroup</a> element directives.
 *
 * ### Option Params
 *
 * When applied, `md-option-empty` will mark the option as "empty" allowing the option to clear the
 * select and put it back in it's default state. You may supply this attribute on any option you
 * wish, however, it is automatically applied to an option whose `value` or `ng-value` are not
 * defined.
 *
 * **Automatically Applied**
 *
 *  - `<md-option>`
 *  - `<md-option value>`
 *  - `<md-option value="">`
 *  - `<md-option ng-value>`
 *  - `<md-option ng-value="">`
 *
 * **NOT Automatically Applied**
 *
 *  - `<md-option ng-value="1">`
 *  - `<md-option ng-value="''">`
 *  - `<md-option ng-value="undefined">`
 *  - `<md-option value="undefined">` (this evaluates to the string `"undefined"`)
 *  - <code ng-non-bindable>&lt;md-option ng-value="{{someValueThatMightBeUndefined}}"&gt;</code>
 *
 * **Note:** A value of `undefined` ***is considered a valid value*** (and does not auto-apply this
 * attribute) since you may wish this to be your "Not Available" or "None" option.
 *
 * **Note:** Using the
 * <a ng-href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#Attributes">value</a>
 * attribute from the `<option>` element (as opposed to the `<md-option>` element's
 * <a ng-href="https://docs.angularjs.org/api/ng/directive/ngValue">ng-value</a>) always evaluates
 * to a `string`. This means that `value="null"` will cause a check against `myValue != "null"`
 * rather than `!myValue` or `myValue != null`.
 * Importantly, this also applies to `number` values. `value="1"` will not match up with an
 * `ng-model` like `$scope.selectedValue = 1`. Use `ng-value="1"` in this case and other cases where
 * you have values that are not strings.
 *
 * **Note:** Please see our <a ng-href="api/directive/mdSelect#selects-and-object-equality">docs on
 * using objects with `md-select`</a> for additional guidance on using the `trackBy` option with
 * `ng-model-options`.
 *
 * @param {expression=} ng-value Binds the given expression to the value of the option.
 * @param {string=} value Attribute to set the value of the option.
 * @param {expression=} ng-repeat <a ng-href="https://docs.angularjs.org/api/ng/directive/ngRepeat">
 *  AngularJS directive</a> that instantiates a template once per item from a collection.
 * @param {expression=} ng-selected <a ng-href="https://docs.angularjs.org/api/ng/directive/ngSelected">
 *  AngularJS directive</a> that adds the `selected` attribute to the option when the expression
 *  evaluates as truthy.
 *
 *  **Note:** Unlike native `option` elements used with AngularJS, `md-option` elements
 *  watch their `selected` attributes for changes and trigger model value changes on `md-select`.
 * @param {boolean=} md-option-empty If the attribute exists, mark the option as "empty" allowing
 * the option to clear the select and put it back in it's default state. You may supply this
 * attribute on any option you wish, however, it is automatically applied to an option whose `value`
 * or `ng-value` are not defined.
 * @param {number=} tabindex The `tabindex` of the option. Defaults to `0`.
 *
 * @usage
 * <hljs lang="html">
 * <md-select ng-model="currentState" placeholder="Select a state">
 *   <md-option ng-value="AL">Alabama</md-option>
 *   <md-option ng-value="AK">Alaska</md-option>
 *   <md-option ng-value="FL">Florida</md-option>
 * </md-select>
 * </hljs>
 *
 * With `ng-repeat`:
 * <hljs lang="html">
 * <md-select ng-model="currentState" placeholder="Select a state">
 *   <md-option ng-value="state" ng-repeat="state in states">{{ state }}</md-option>
 * </md-select>
 * </hljs>
 */
function OptionDirective($mdButtonInkRipple, $mdUtil, $mdTheming) {

  return {
    restrict: 'E',
    require: ['mdOption', '^^mdSelectMenu'],
    controller: OptionController,
    compile: compile
  };

  /**
   * @param {JQLite} element
   * @param {IAttributes} attrs
   * @return {postLink}
   */
  function compile(element, attrs) {
    // Manual transclusion to avoid the extra inner <span> that ng-transclude generates
    element.append(angular.element('<div class="md-text">').append(element.contents()));

    element.attr('tabindex', attrs.tabindex || '0');

    if (!hasDefinedValue(attrs)) {
      element.attr('md-option-empty', '');
    }

    return postLink;
  }

  /**
   * @param {Object} attrs list of attributes from the compile function
   * @return {string|undefined|null} if defined and non-empty, return the value of the option's
   *  value attribute, otherwise return the value of the option's ng-value attribute.
   */
  function hasDefinedValue(attrs) {
    var value = attrs.value;
    var ngValue = attrs.ngValue;

    return value || ngValue;
  }

  function postLink(scope, element, attrs, ctrls) {
    var optionCtrl = ctrls[0];
    var selectMenuCtrl = ctrls[1];

    $mdTheming(element);

    if (selectMenuCtrl.isMultiple) {
      element.addClass('md-checkbox-enabled');
      element.prepend(CHECKBOX_SELECTION_INDICATOR.clone());
    }

    if (angular.isDefined(attrs.ngValue)) {
      scope.$watch(attrs.ngValue, function (newValue, oldValue) {
        setOptionValue(newValue, oldValue);
        element.removeAttr('aria-checked');
      });
    } else if (angular.isDefined(attrs.value)) {
      setOptionValue(attrs.value);
    } else {
      scope.$watch(function() {
        return element.text().trim();
      }, setOptionValue);
    }

    attrs.$observe('disabled', function(disabled) {
      if (disabled) {
        element.attr('tabindex', '-1');
      } else {
        element.attr('tabindex', '0');
      }
    });

    scope.$$postDigest(function() {
      attrs.$observe('selected', function(selected) {
        if (!angular.isDefined(selected)) return;
        if (typeof selected == 'string') selected = true;
        if (selected) {
          if (!selectMenuCtrl.isMultiple) {
            selectMenuCtrl.deselect(Object.keys(selectMenuCtrl.selected)[0]);
          }
          selectMenuCtrl.select(optionCtrl.hashKey, optionCtrl.value);
        } else {
          selectMenuCtrl.deselect(optionCtrl.hashKey);
        }
        selectMenuCtrl.refreshViewValue();
      });
    });

    $mdButtonInkRipple.attach(scope, element);
    configureAria();

    /**
     * @param {*} newValue the option's new value
     * @param {*=} oldValue the option's previous value
     * @param {boolean=} prevAttempt true if this had to be attempted again due to an undefined
     *  hashGetter on the selectMenuCtrl, undefined otherwise.
     */
    function setOptionValue(newValue, oldValue, prevAttempt) {
      if (!selectMenuCtrl.hashGetter) {
        if (!prevAttempt) {
          scope.$$postDigest(function() {
            setOptionValue(newValue, oldValue, true);
          });
        }
        return;
      }
      var oldHashKey = selectMenuCtrl.hashGetter(oldValue, scope);
      var newHashKey = selectMenuCtrl.hashGetter(newValue, scope);

      optionCtrl.hashKey = newHashKey;
      optionCtrl.value = newValue;

      selectMenuCtrl.removeOption(oldHashKey, optionCtrl);
      selectMenuCtrl.addOption(newHashKey, optionCtrl);
    }

    scope.$on('$destroy', function() {
      selectMenuCtrl.removeOption(optionCtrl.hashKey, optionCtrl);
    });

    function configureAria() {
      var ariaAttrs = {
        'role': 'option'
      };

      // We explicitly omit the `aria-selected` attribute from single-selection, unselected
      // options. Including the `aria-selected="false"` attributes adds a significant amount of
      // noise to screen-reader users without providing useful information.
      if (selectMenuCtrl.isMultiple) {
        ariaAttrs['aria-selected'] = 'false';
      }

      if (!element[0].hasAttribute('id')) {
        ariaAttrs.id = 'select_option_' + $mdUtil.nextUid();
      }
      element.attr(ariaAttrs);
    }
  }
}

/**
 * @param {JQLite} $element
 * @constructor
 */
function OptionController($element) {
  /**
   * @param {boolean} isSelected
   * @param {boolean=} isMultiple
   */
  this.setSelected = function(isSelected, isMultiple) {
    if (isSelected) {
      $element.attr({
        'selected': 'true',
        'aria-selected': 'true'
      });
    } else if (!isSelected) {
      $element.removeAttr('selected');

      if (isMultiple) {
        $element.attr('aria-selected', 'false');
      } else {
        // We explicitly omit the `aria-selected` attribute from single-selection, unselected
        // options. Including the `aria-selected="false"` attributes adds a significant amount of
        // noise to screen-reader users without providing useful information.
        $element.removeAttr('aria-selected');
      }
    }
  };
}

/**
 * @ngdoc directive
 * @name mdOptgroup
 * @restrict E
 * @module material.components.select
 *
 * @description Displays a label separating groups of
 * <a ng-href="api/directive/mdOption">md-option</a> element directives in a
 * <a ng-href="api/directive/mdSelect">md-select</a> box's dropdown menu.
 *
 * **Note:** When using `md-select-header` element directives within a `md-select`, the labels that
 * would normally be added to the <a ng-href="api/directive/mdOptgroup">md-optgroup</a> directives
 * are omitted, allowing the `md-select-header` to represent the option group label
 * (and possibly more).
 *
 * @usage
 * With label attributes
 * <hljs lang="html">
 * <md-select ng-model="currentState" placeholder="Select a state">
 *   <md-optgroup label="Southern">
 *     <md-option ng-value="AL">Alabama</md-option>
 *     <md-option ng-value="FL">Florida</md-option>
 *   </md-optgroup>
 *   <md-optgroup label="Northern">
 *     <md-option ng-value="AK">Alaska</md-option>
 *     <md-option ng-value="MA">Massachusetts</md-option>
 *   </md-optgroup>
 * </md-select>
 * </hljs>
 *
 * With label elements
 * <hljs lang="html">
 * <md-select ng-model="currentState" placeholder="Select a state">
 *   <md-optgroup>
 *     <label>Southern</label>
 *     <md-option ng-value="AL">Alabama</md-option>
 *     <md-option ng-value="FL">Florida</md-option>
 *   </md-optgroup>
 *   <md-optgroup>
 *     <label>Northern</label>
 *     <md-option ng-value="AK">Alaska</md-option>
 *     <md-option ng-value="MA">Massachusetts</md-option>
 *   </md-optgroup>
 * </md-select>
 * </hljs>
 *
 * @param {string=} label The option group's label.
 */
function OptgroupDirective() {
  return {
    restrict: 'E',
    compile: compile
  };
  function compile(element, attrs) {
    // If we have a select header element, we don't want to add the normal label
    // header.
    if (!hasSelectHeader()) {
      setupLabelElement();
    }
    element.attr('role', 'group');

    function hasSelectHeader() {
      return element.parent().find('md-select-header').length;
    }

    function setupLabelElement() {
      var labelElement = element.find('label');
      if (!labelElement.length) {
        labelElement = angular.element('<label>');
        element.prepend(labelElement);
      }
      labelElement.addClass('md-container-ignore');
      labelElement.attr('aria-hidden', 'true');
      if (attrs.label) {
        labelElement.text(attrs.label);
      }
      element.attr('aria-label', labelElement.text());
    }
  }
}

function SelectHeaderDirective() {
  return {
    restrict: 'E',
  };
}

function SelectProvider($$interimElementProvider) {
  return $$interimElementProvider('$mdSelect')
    .setDefaults({
      methods: ['target'],
      options: selectDefaultOptions
    });

  /* @ngInject */
  function selectDefaultOptions($mdSelect, $mdConstant, $mdUtil, $window, $q, $$rAF, $animateCss, $animate, $document) {
    var ERROR_TARGET_EXPECTED = "$mdSelect.show() expected a target element in options.target but got '{0}'!";
    var animator = $mdUtil.dom.animator;
    var keyCodes = $mdConstant.KEY_CODE;

    return {
      parent: 'body',
      themable: true,
      onShow: onShow,
      onRemove: onRemove,
      hasBackdrop: true,
      disableParentScroll: true
    };

    /**
     * Interim-element onRemove logic....
     */
    function onRemove(scope, element, opts) {
      var animationRunner = null;
      var destroyListener = scope.$on('$destroy', function() {
        // Listen for the case where the element was destroyed while there was an
        // ongoing close animation. If this happens, we need to end the animation
        // manually.
        animationRunner.end();
      });

      opts = opts || { };
      opts.cleanupInteraction();
      opts.cleanupResizing();
      opts.hideBackdrop();

      // For navigation $destroy events, do a quick, non-animated removal,
      // but for normal closes (from clicks, etc) animate the removal
      return (opts.$destroy === true) ? cleanElement() : animateRemoval().then(cleanElement);

      /**
       * For normal closes (eg clicks), animate the removal.
       * For forced closes (like $destroy events from navigation),
       * skip the animations.
       */
      function animateRemoval() {
        animationRunner = $animateCss(element, {addClass: 'md-leave'});
        return animationRunner.start();
      }

      /**
       * Restore the element to a closed state
       */
      function cleanElement() {
        destroyListener();

        element
          .removeClass('md-active')
          .attr('aria-hidden', 'true')
          .css({
            'display': 'none',
            'top': '',
            'right': '',
            'bottom': '',
            'left': '',
            'font-size': '',
            'min-width': ''
          });

        announceClosed(opts);

        if (!opts.$destroy) {
          if (opts.restoreFocus) {
            opts.target.focus();
          } else {
            // Make sure that the container's md-input-focused is removed on backdrop click.
            $mdUtil.nextTick(function() {
              opts.target.triggerHandler('blur');
            }, true);
          }
        }
      }
    }

    /**
     * Interim-element onShow logic.
     */
    function onShow(scope, element, opts) {

      watchAsyncLoad();
      sanitizeAndConfigure(scope, opts);

      opts.hideBackdrop = showBackdrop(scope, element, opts);

      return showDropDown(scope, element, opts)
        .then(function(response) {
          element.attr('aria-hidden', 'false');
          opts.alreadyOpen = true;
          opts.cleanupInteraction = activateInteraction();
          opts.cleanupResizing = activateResizing();
          opts.contentEl[0].focus();

          return response;
        }, opts.hideBackdrop);

      // ************************************
      // Closure Functions
      // ************************************

      /**
       * Attach the select DOM element(s) and animate to the correct positions and scale.
       */
      function showDropDown(scope, element, opts) {
        if (opts.parent !== element.parent()) {
          element.parent().attr('aria-owns', element.find('md-content').attr('id'));
        }

        opts.parent.append(element);

        return $q(function(resolve, reject) {
          try {
            $animateCss(element, {removeClass: 'md-leave', duration: 0})
              .start()
              .then(positionAndFocusMenu)
              .then(resolve);

          } catch (e) {
            reject(e);
          }
        });
      }

      /**
       * Initialize container and dropDown menu positions/scale, then animate to show.
       * @return {*} a Promise that resolves after the menu is animated in and an item is focused
       */
      function positionAndFocusMenu() {
        return $q(function(resolve) {
          if (opts.isRemoved) return $q.reject(false);

          var info = calculateMenuPositions(scope, element, opts);

          info.container.element.css(animator.toCss(info.container.styles));
          info.dropDown.element.css(animator.toCss(info.dropDown.styles));

          $$rAF(function() {
            element.addClass('md-active');
            info.dropDown.element.css(animator.toCss({transform: ''}));
            autoFocus(opts.focusedNode);

            resolve();
          });

        });
      }

      /**
       * Show modal backdrop element.
       */
      function showBackdrop(scope, element, options) {

        // If we are not within a dialog...
        if (options.disableParentScroll && !$mdUtil.getClosest(options.target, 'MD-DIALOG')) {
          // !! DO this before creating the backdrop; since disableScrollAround()
          //    configures the scroll offset; which is used by mdBackDrop postLink()
          options.restoreScroll = $mdUtil.disableScrollAround(options.element, options.parent);
        } else {
          options.disableParentScroll = false;
        }

        if (options.hasBackdrop) {
          // Override duration to immediately show invisible backdrop
          options.backdrop = $mdUtil.createBackdrop(scope, "md-select-backdrop md-click-catcher");
          $animate.enter(options.backdrop, $document[0].body, null, {duration: 0});
        }

        /**
         * Hide modal backdrop element...
         */
        return function hideBackdrop() {
          if (options.backdrop) options.backdrop.remove();
          if (options.disableParentScroll) options.restoreScroll();

          delete options.restoreScroll;
        };
      }

      /**
       * @param {Element|HTMLElement|null=} previousNode
       * @param {Element|HTMLElement} node
       * @param {SelectMenuController|Function|object=} menuController SelectMenuController instance
       */
      function focusOptionNode(previousNode, node, menuController) {
        var listboxContentNode = opts.contentEl[0];

        if (node) {
          if (previousNode) {
            previousNode.classList.remove('md-focused');
          }

          node.classList.add('md-focused');
          if (menuController && menuController.setActiveDescendant) {
            menuController.setActiveDescendant(node.id);
          }

          // Scroll the node into view if needed.
          if (listboxContentNode.scrollHeight > listboxContentNode.clientHeight) {
            var scrollBottom = listboxContentNode.clientHeight + listboxContentNode.scrollTop;
            var nodeBottom = node.offsetTop + node.offsetHeight;
            if (nodeBottom > scrollBottom) {
              listboxContentNode.scrollTop = nodeBottom - listboxContentNode.clientHeight;
            } else if (node.offsetTop < listboxContentNode.scrollTop) {
              listboxContentNode.scrollTop = node.offsetTop;
            }
          }
          opts.focusedNode = node;
          if (menuController && menuController.refreshViewValue) {
            menuController.refreshViewValue();
          }
        }
      }

      /**
       * @param {Element|HTMLElement} nodeToFocus
       */
      function autoFocus(nodeToFocus) {
        var selectMenuController;
        if (nodeToFocus && !nodeToFocus.hasAttribute('disabled')) {
          selectMenuController = opts.selectEl.controller('mdSelectMenu');
          focusOptionNode(null, nodeToFocus, selectMenuController);
        }
      }

      /**
       * Check for valid opts and set some useful defaults
       */
      function sanitizeAndConfigure(scope, options) {
        var selectMenuElement = element.find('md-select-menu');

        if (!options.target) {
          throw new Error($mdUtil.supplant(ERROR_TARGET_EXPECTED, [options.target]));
        }

        angular.extend(options, {
          isRemoved: false,
          target: angular.element(options.target), // make sure it's not a naked DOM node
          parent: angular.element(options.parent),
          selectEl: selectMenuElement,
          contentEl: element.find('md-content'),
          optionNodes: selectMenuElement[0].getElementsByTagName('md-option')
        });
      }

      /**
       * Configure various resize listeners for screen changes
       */
      function activateResizing() {
        var debouncedOnResize = (function(scope, target, options) {

          return function() {
            if (options.isRemoved) return;

            var updates = calculateMenuPositions(scope, target, options);
            var container = updates.container;
            var dropDown = updates.dropDown;

            container.element.css(animator.toCss(container.styles));
            dropDown.element.css(animator.toCss(dropDown.styles));
          };

        })(scope, element, opts);

        var window = angular.element($window);
        window.on('resize', debouncedOnResize);
        window.on('orientationchange', debouncedOnResize);

        // Publish deactivation closure...
        return function deactivateResizing() {

          // Disable resizing handlers
          window.off('resize', debouncedOnResize);
          window.off('orientationchange', debouncedOnResize);
        };
      }

      /**
       * If asynchronously loading, watch and update internal '$$loadingAsyncDone' flag.
       */
      function watchAsyncLoad() {
        if (opts.loadingAsync && !opts.isRemoved) {
          scope.$$loadingAsyncDone = false;

          $q.when(opts.loadingAsync)
            .then(function() {
              scope.$$loadingAsyncDone = true;
              delete opts.loadingAsync;
            }).then(function() {
              $$rAF(positionAndFocusMenu);
            });
        }
      }

      function activateInteraction() {
        if (opts.isRemoved) {
          return;
        }

        var dropDown = opts.selectEl;
        var selectMenuController = dropDown.controller('mdSelectMenu') || {};

        element.addClass('md-clickable');

        // Close on backdrop click
        opts.backdrop && opts.backdrop.on('click', onBackdropClick);

        // Escape to close
        // Cycling of options, and closing on enter
        dropDown.on('keydown', onMenuKeyDown);
        dropDown.on('click', checkCloseMenu);

        return function cleanupInteraction() {
          opts.backdrop && opts.backdrop.off('click', onBackdropClick);
          dropDown.off('keydown', onMenuKeyDown);
          dropDown.off('click', checkCloseMenu);

          element.removeClass('md-clickable');
          opts.isRemoved = true;
        };

        // ************************************
        // Closure Functions
        // ************************************

        function onBackdropClick(e) {
          e.preventDefault();
          e.stopPropagation();
          opts.restoreFocus = false;
          $mdUtil.nextTick($mdSelect.hide, true);
        }

        function onMenuKeyDown(ev) {
          ev.preventDefault();
          ev.stopPropagation();

          switch (ev.keyCode) {
            case keyCodes.UP_ARROW:
              return focusPrevOption();
            case keyCodes.DOWN_ARROW:
              return focusNextOption();
            case keyCodes.SPACE:
            case keyCodes.ENTER:
              if (opts.focusedNode) {
                dropDown.triggerHandler({
                  type: 'click',
                  target: opts.focusedNode
                });
                ev.preventDefault();
              }
              checkCloseMenu(ev);
              break;
            case keyCodes.TAB:
            case keyCodes.ESCAPE:
              ev.stopPropagation();
              ev.preventDefault();
              opts.restoreFocus = true;
              $mdUtil.nextTick($mdSelect.hide, true);
              break;
            default:
              if (shouldHandleKey(ev, $mdConstant)) {
                var optNode = selectMenuController.optNodeForKeyboardSearch(ev);
                if (optNode && !optNode.hasAttribute('disabled')) {
                  focusOptionNode(opts.focusedNode, optNode, selectMenuController);
                }
              }
          }
        }

        /**
         * Change the focus to another option. If there is no focused option, focus the first
         * option. If there is a focused option, then use the direction to determine if we should
         * focus the previous or next option in the list.
         * @param {'next'|'prev'} direction
         */
        function focusOption(direction) {
          var optionsArray = $mdUtil.nodesToArray(opts.optionNodes);
          var index = optionsArray.indexOf(opts.focusedNode);
          var prevOption = optionsArray[index];
          var newOption;

          do {
            if (index === -1) {
              // We lost the previously focused element, reset to first option
              index = 0;
            } else if (direction === 'next' && index < optionsArray.length - 1) {
              index++;
            } else if (direction === 'prev' && index > 0) {
              index--;
            }
            newOption = optionsArray[index];
            if (newOption.hasAttribute('disabled')) {
              newOption = null;
            }
          } while (!newOption && index < optionsArray.length - 1 && index > 0);

          focusOptionNode(prevOption, newOption, selectMenuController);
        }

        function focusNextOption() {
          focusOption('next');
        }

        function focusPrevOption() {
          focusOption('prev');
        }

        /**
         * @param {KeyboardEvent|MouseEvent} event
         */
        function checkCloseMenu(event) {
          if (event && (event.type === 'click') && (event.currentTarget !== dropDown[0])) {
            return;
          }
          if (mouseOnScrollbar()) {
            return;
          }

          if (opts.focusedNode && opts.focusedNode.hasAttribute &&
              !opts.focusedNode.hasAttribute('disabled')) {
            event.preventDefault();
            event.stopPropagation();
            if (!selectMenuController.isMultiple) {
              opts.restoreFocus = true;

              $mdUtil.nextTick(function () {
                $mdSelect.hide(selectMenuController.ngModel.$viewValue);
                opts.focusedNode.classList.remove('md-focused');
              }, true);
            }
          }

          /**
           * check if the mouseup event was on a scrollbar
           */
          function mouseOnScrollbar() {
            var clickOnScrollbar = false;
            if (event && (event.currentTarget.children.length > 0)) {
              var child = event.currentTarget.children[0];
              var hasScrollbar = child.scrollHeight > child.clientHeight;
              if (hasScrollbar && child.children.length > 0) {
                var relPosX = event.pageX - event.currentTarget.getBoundingClientRect().left;
                if (relPosX > child.querySelector('md-option').offsetWidth)
                  clickOnScrollbar = true;
              }
            }
            return clickOnScrollbar;
          }
        }
      }
    }

    /**
     * To notify listeners that the Select menu has closed,
     * trigger the [optional] user-defined expression
     */
    function announceClosed(opts) {
      var mdSelect = opts.selectCtrl;
      if (mdSelect) {
        var menuController = opts.selectEl.controller('mdSelectMenu');
        mdSelect.setSelectValueText(menuController ? menuController.getSelectedLabels() : '');
        mdSelect.triggerClose();
      }
    }


    /**
     * Calculate the menu positions after an event like options changing, screen resizing, or
     * animations finishing.
     * @param {Object} scope
     * @param element
     * @param opts
     * @return {{container: {styles: {top: number, left: number, 'font-size': *, 'min-width': number}, element: Object}, dropDown: {styles: {transform: string, transformOrigin: string}, element: Object}}}
     */
    function calculateMenuPositions(scope, element, opts) {
      var
        containerNode = element[0],
        targetNode = opts.target[0].children[0], // target the label
        parentNode = $document[0].body,
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
        selectedNode = selectNode.querySelector('md-option[selected]'),
        optionNodes = selectNode.getElementsByTagName('md-option'),
        optgroupNodes = selectNode.getElementsByTagName('md-optgroup'),
        isScrollable = calculateScrollable(element, contentNode),
        centeredNode;

      var loading = isPromiseLike(opts.loadingAsync);
      if (!loading) {
        // If a selected node, center around that
        if (selectedNode) {
          centeredNode = selectedNode;
          // If there are option groups, center around the first option group
        } else if (optgroupNodes.length) {
          centeredNode = optgroupNodes[0];
          // Otherwise - if we are not loading async - center around the first optionNode
        } else if (optionNodes.length) {
          centeredNode = optionNodes[0];
          // In case there are no options, center on whatever's in there... (eg progress indicator)
        } else {
          centeredNode = contentNode.firstElementChild || contentNode;
        }
      } else {
        // If loading, center on progress indicator
        centeredNode = contentNode.firstElementChild || contentNode;
      }

      if (contentNode.offsetWidth > maxWidth) {
        contentNode.style['max-width'] = maxWidth + 'px';
      } else {
        contentNode.style.maxWidth = null;
      }
      if (shouldOpenAroundTarget) {
        contentNode.style['min-width'] = targetRect.width + 'px';
      }

      // Remove padding before we compute the position of the menu
      if (isScrollable) {
        selectNode.classList.add('md-overflow');
      }

      var focusedNode = centeredNode;
      if ((focusedNode.tagName || '').toUpperCase() === 'MD-OPTGROUP') {
        focusedNode = optionNodes[0] || contentNode.firstElementChild || contentNode;
        centeredNode = focusedNode;
      }
      // Cache for autoFocus()
      opts.focusedNode = focusedNode;

      // Get the selectMenuRect *after* max-width is possibly set above
      containerNode.style.display = 'block';
      var selectMenuRect = selectNode.getBoundingClientRect();
      var centeredRect = getOffsetRect(centeredNode);

      if (centeredNode) {
        var centeredStyle = $window.getComputedStyle(centeredNode);
        centeredRect.paddingLeft = parseInt(centeredStyle.paddingLeft, 10) || 0;
        centeredRect.paddingRight = parseInt(centeredStyle.paddingRight, 10) || 0;
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

      var left, top, transformOrigin, minWidth, fontSize;
      if (shouldOpenAroundTarget) {
        left = targetRect.left;
        top = targetRect.top + targetRect.height;
        transformOrigin = '50% 0';
        if (top + selectMenuRect.height > bounds.bottom) {
          top = targetRect.top - selectMenuRect.height;
          transformOrigin = '50% 100%';
        }
      } else {
        left = (targetRect.left + centeredRect.left - centeredRect.paddingLeft);
        top = Math.floor(targetRect.top + targetRect.height / 2 - centeredRect.height / 2 -
            centeredRect.top + contentNode.scrollTop) + 2;

        transformOrigin = (centeredRect.left + targetRect.width / 2) + 'px ' +
          (centeredRect.top + centeredRect.height / 2 - contentNode.scrollTop) + 'px 0px';

        minWidth = Math.min(targetRect.width + centeredRect.paddingLeft + centeredRect.paddingRight, maxWidth);

        fontSize = window.getComputedStyle(targetNode)['font-size'];
      }

      // Keep left and top within the window
      var containerRect = containerNode.getBoundingClientRect();
      var scaleX = Math.round(100 * Math.min(targetRect.width / selectMenuRect.width, 1.0)) / 100;
      var scaleY = Math.round(100 * Math.min(targetRect.height / selectMenuRect.height, 1.0)) / 100;

      return {
        container: {
          element: angular.element(containerNode),
          styles: {
            left: Math.floor(clamp(bounds.left, left, bounds.right - minWidth)),
            top: Math.floor(clamp(bounds.top, top, bounds.bottom - containerRect.height)),
            'min-width': minWidth,
            'font-size': fontSize
          }
        },
        dropDown: {
          element: angular.element(selectNode),
          styles: {
            transformOrigin: transformOrigin,
            transform: !opts.alreadyOpen ? $mdUtil.supplant('scale({0},{1})', [scaleX, scaleY]) : ""
          }
        }
      };
    }
  }

  function isPromiseLike(obj) {
    return obj && angular.isFunction(obj.then);
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
    } : {left: 0, top: 0, width: 0, height: 0};
  }

  function calculateScrollable(element, contentNode) {
    var isScrollable = false;

    try {
      var oldDisplay = element[0].style.display;

      // Set the element's display to block so that this calculation is correct
      element[0].style.display = 'block';

      isScrollable = contentNode.scrollHeight > contentNode.offsetHeight;

      // Reset it back afterwards
      element[0].style.display = oldDisplay;
    } finally {
      // Nothing to do
    }
    return isScrollable;
  }
}

function shouldHandleKey(ev, $mdConstant) {
  var char = String.fromCharCode(ev.keyCode);
  var isNonUsefulKey = (ev.keyCode <= 31);

  return (char && char.length && !isNonUsefulKey &&
    !$mdConstant.isMetaKey(ev) && !$mdConstant.isFnLockKey(ev) && !$mdConstant.hasModifierKey(ev));
}
