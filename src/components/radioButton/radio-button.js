/**
 * @ngdoc module
 * @name material.components.radioButton
 * @description radioButton module!
 */
angular.module('material.components.radioButton', [
  'material.core'
])
  .directive('mdRadioGroup', mdRadioGroupDirective)
  .directive('mdRadioButton', mdRadioButtonDirective);

/**
 * @type {Readonly<{NEXT: number, CURRENT: number, PREVIOUS: number}>}
 */
var incrementSelection = Object.freeze({PREVIOUS: -1, CURRENT: 0, NEXT: 1});

/**
 * @ngdoc directive
 * @module material.components.radioButton
 * @name mdRadioGroup
 *
 * @restrict E
 *
 * @description
 * The `<md-radio-group>` directive identifies a grouping
 * container for the 1..n grouped radio buttons; specified using nested
 * `<md-radio-button>` elements.
 *
 * The radio button uses the accent color by default. The primary color palette may be used with
 * the `md-primary` class.
 *
 * Note: `<md-radio-group>` and `<md-radio-button>` handle `tabindex` differently
 * than the native `<input type="radio">` controls. Whereas the native controls
 * force the user to tab through all the radio buttons, `<md-radio-group>`
 * is focusable and by default the `<md-radio-button>`s are not.
 *
 * @param {string} ng-model Assignable angular expression to data-bind to.
 * @param {string=} ng-change AngularJS expression to be executed when input changes due to user
 *    interaction.
 * @param {boolean=} md-no-ink If present, disables ink ripple effects.
 *
 * @usage
 * <hljs lang="html">
 * <md-radio-group ng-model="selected">
 *   <md-radio-button ng-repeat="item in items"
 *                    ng-value="item.value" aria-label="{{item.label}}">
 *     {{ item.label }}
 *   </md-radio-button>
 * </md-radio-group>
 * </hljs>
 */
function mdRadioGroupDirective($mdUtil, $mdConstant, $mdTheming, $timeout) {
  RadioGroupController.prototype = createRadioGroupControllerProto();

  return {
    restrict: 'E',
    controller: ['$element', RadioGroupController],
    require: ['mdRadioGroup', '?ngModel'],
    link: { pre: linkRadioGroup }
  };

  function linkRadioGroup(scope, element, attr, controllers) {
    // private md component indicator for styling
    element.addClass('_md');
    $mdTheming(element);

    var radioGroupController = controllers[0];
    var ngModelCtrl = controllers[1] || $mdUtil.fakeNgModel();

    radioGroupController.init(ngModelCtrl);

    scope.mouseActive = false;

    element
      .attr({
        'role': 'radiogroup',
        'tabIndex': element.attr('tabindex') || '0'
      })
      .on('keydown', keydownListener)
      .on('mousedown', function() {
        scope.mouseActive = true;
        $timeout(function() {
          scope.mouseActive = false;
        }, 100);
      })
      .on('focus', function() {
        if (scope.mouseActive === false) {
          radioGroupController.$element.addClass('md-focused');
        }
      })
      .on('blur', function() {
        radioGroupController.$element.removeClass('md-focused');
      });

    // Initially set the first radio button as the aria-activedescendant. This will be overridden
    // if a 'checked' radio button gets rendered. We need to wait for the nextTick here so that the
    // radio buttons have their id values assigned.
    $mdUtil.nextTick(function () {
      var radioButtons = getRadioButtons(radioGroupController.$element);
      if (radioButtons.count() &&
          !radioGroupController.$element[0].hasAttribute('aria-activedescendant')) {
        radioGroupController.setActiveDescendant(radioButtons.first().id);
      }
    });

    /**
     * Apply the md-focused class if it isn't already applied.
     */
    function setFocus() {
      if (!element.hasClass('md-focused')) { element.addClass('md-focused'); }
    }

    /**
     * @param {KeyboardEvent} keyboardEvent
     */
    function keydownListener(keyboardEvent) {
      var keyCode = keyboardEvent.which || keyboardEvent.keyCode;

      // Only listen to events that we originated ourselves
      // so that we don't trigger on things like arrow keys in inputs.
      if (keyCode !== $mdConstant.KEY_CODE.ENTER &&
          keyboardEvent.currentTarget !== keyboardEvent.target) {
        return;
      }

      switch (keyCode) {
        case $mdConstant.KEY_CODE.LEFT_ARROW:
        case $mdConstant.KEY_CODE.UP_ARROW:
          keyboardEvent.preventDefault();
          radioGroupController.selectPrevious();
          setFocus();
          break;

        case $mdConstant.KEY_CODE.RIGHT_ARROW:
        case $mdConstant.KEY_CODE.DOWN_ARROW:
          keyboardEvent.preventDefault();
          radioGroupController.selectNext();
          setFocus();
          break;

        case $mdConstant.KEY_CODE.SPACE:
          keyboardEvent.preventDefault();
          radioGroupController.selectCurrent();
          break;

        case $mdConstant.KEY_CODE.ENTER:
          var form = angular.element($mdUtil.getClosest(element[0], 'form'));
          if (form.length > 0) {
            form.triggerHandler('submit');
          }
          break;
      }
    }
  }

  /**
   * @param {JQLite} $element
   * @constructor
   */
  function RadioGroupController($element) {
    this._radioButtonRenderFns = [];
    this.$element = $element;
  }

  function createRadioGroupControllerProto() {
    return {
      init: function(ngModelCtrl) {
        this._ngModelCtrl = ngModelCtrl;
        this._ngModelCtrl.$render = angular.bind(this, this.render);
      },
      add: function(rbRender) {
        this._radioButtonRenderFns.push(rbRender);
      },
      remove: function(rbRender) {
        var index = this._radioButtonRenderFns.indexOf(rbRender);
        if (index !== -1) {
          this._radioButtonRenderFns.splice(index, 1);
        }
      },
      render: function() {
        this._radioButtonRenderFns.forEach(function(rbRender) {
          rbRender();
        });
      },
      setViewValue: function(value, eventType) {
        this._ngModelCtrl.$setViewValue(value, eventType);
        // update the other radio buttons as well
        this.render();
      },
      getViewValue: function() {
        return this._ngModelCtrl.$viewValue;
      },
      selectCurrent: function() {
        return changeSelectedButton(this.$element, incrementSelection.CURRENT);
      },
      selectNext: function() {
        return changeSelectedButton(this.$element, incrementSelection.NEXT);
      },
      selectPrevious: function() {
        return changeSelectedButton(this.$element, incrementSelection.PREVIOUS);
      },
      setActiveDescendant: function (radioId) {
        this.$element.attr('aria-activedescendant', radioId);
      },
      isDisabled: function() {
        return this.$element[0].hasAttribute('disabled');
      }
    };
  }

  /**
   * Coerce all child radio buttons into an array, then wrap them in an iterator.
   * @param parent {!JQLite}
   * @return {{add: add, next: (function()), last: (function(): any|null), previous: (function()), count: (function(): number), hasNext: (function(*=): Array.length|*|number|boolean), inRange: (function(*): boolean), remove: remove, contains: (function(*=): *|boolean), itemAt: (function(*=): any|null), findBy: (function(*, *): *[]), hasPrevious: (function(*=): Array.length|*|number|boolean), items: (function(): *[]), indexOf: (function(*=): number), first: (function(): any|null)}}
   */
  function getRadioButtons(parent) {
    return $mdUtil.iterator(parent[0].querySelectorAll('md-radio-button'), true);
  }

  /**
   * Change the radio group's selected button by a given increment.
   * If no button is selected, select the first button.
   * @param {JQLite} parent the md-radio-group
   * @param {incrementSelection} increment enum that determines whether the next or
   *  previous button is clicked. For current, only the first button is selected, otherwise the
   *  current selection is maintained (by doing nothing).
   */
  function changeSelectedButton(parent, increment) {
    var buttons = getRadioButtons(parent);
    var target;

    if (buttons.count()) {
      var validate = function (button) {
        // If disabled, then NOT valid
        return !angular.element(button).attr("disabled");
      };

      var selected = parent[0].querySelector('md-radio-button.md-checked');
      if (!selected) {
        target = buttons.first();
      } else if (increment === incrementSelection.PREVIOUS ||
                 increment === incrementSelection.NEXT) {
        target = buttons[
          increment === incrementSelection.PREVIOUS ? 'previous' : 'next'
        ](selected, validate);
      }

      if (target) {
        // Activate radioButton's click listener (triggerHandler won't create a real click event)
        angular.element(target).triggerHandler('click');
      }
    }
  }
}

/**
 * @ngdoc directive
 * @module material.components.radioButton
 * @name mdRadioButton
 *
 * @restrict E
 *
 * @description
 * The `<md-radio-button>`directive is the child directive required to be used within `<md-radio-group>` elements.
 *
 * While similar to the `<input type="radio" ng-model="" value="">` directive,
 * the `<md-radio-button>` directive provides ink effects, ARIA support, and
 * supports use within named radio groups.
 *
 * One of `value` or `ng-value` must be set so that the `md-radio-group`'s model is set properly when the
 * `md-radio-button` is selected.
 *
 * @param {string} value The value to which the model should be set when selected.
 * @param {string} ng-value AngularJS expression which sets the value to which the model should
 *    be set when selected.
 * @param {string=} name Property name of the form under which the control is published.
 * @param {string=} aria-label Adds label to radio button for accessibility.
 *    Defaults to radio button's text. If no text content is available, a warning will be logged.
 *
 * @usage
 * <hljs lang="html">
 *
 * <md-radio-button value="1" aria-label="Label 1">
 *   Label 1
 * </md-radio-button>
 *
 * <md-radio-button ng-value="specialValue" aria-label="Green">
 *   Green
 * </md-radio-button>
 *
 * </hljs>
 *
 */
function mdRadioButtonDirective($mdAria, $mdUtil, $mdTheming) {

  var CHECKED_CSS = 'md-checked';

  return {
    restrict: 'E',
    require: '^mdRadioGroup',
    transclude: true,
    template: '<div class="md-container" md-ink-ripple md-ink-ripple-checkbox>' +
                '<div class="md-off"></div>' +
                '<div class="md-on"></div>' +
              '</div>' +
              '<div ng-transclude class="md-label"></div>',
    link: link
  };

  function link(scope, element, attr, radioGroupController) {
    var lastChecked;

    $mdTheming(element);
    configureAria(element);
    element.addClass('md-auto-horizontal-margin');

    // ngAria overwrites the aria-checked inside a $watch for ngValue.
    // We should defer the initialization until all the watches have fired.
    // This can also be fixed by removing the `lastChecked` check, but that'll
    // cause more DOM manipulation on each digest.
    if (attr.ngValue) {
      $mdUtil.nextTick(initialize, false);
    } else {
      initialize();
    }

    /**
     * Initializes the component.
     */
    function initialize() {
      if (!radioGroupController) {
        throw 'RadioButton: No RadioGroupController could be found.';
      }

      radioGroupController.add(render);
      attr.$observe('value', render);

      element
        .on('click', listener)
        .on('$destroy', function() {
          radioGroupController.remove(render);
        });
    }

    /**
     * On click functionality.
     */
    function listener(ev) {
      if (element[0].hasAttribute('disabled') || radioGroupController.isDisabled()) return;

      scope.$apply(function() {
        radioGroupController.setViewValue(attr.value, ev && ev.type);
      });
    }

    /**
     * Add or remove the `.md-checked` class from the RadioButton (and conditionally its parent).
     * Update the `aria-activedescendant` attribute.
     */
    function render() {
      var checked = radioGroupController.getViewValue() == attr.value;

      if (checked === lastChecked) return;

      if (element[0] && element[0].parentNode &&
          element[0].parentNode.nodeName.toLowerCase() !== 'md-radio-group') {
        // If the radioButton is inside a div, then add class so highlighting will work.
        element.parent().toggleClass(CHECKED_CSS, checked);
      }

      if (checked) {
        radioGroupController.setActiveDescendant(element.attr('id'));
      }

      lastChecked = checked;

      element
        .attr('aria-checked', checked)
        .toggleClass(CHECKED_CSS, checked);
    }

    /**
     * Inject ARIA-specific attributes appropriate for each radio button
     */
    function configureAria(element) {
      element.attr({
        id: attr.id || 'radio_' + $mdUtil.nextUid(),
        role: 'radio',
        'aria-checked': 'false'
      });

      $mdAria.expectWithText(element, 'aria-label');
    }
  }
}
