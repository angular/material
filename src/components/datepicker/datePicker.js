(function() {
  'use strict';

  // PRE RELEASE
  // TODO(jelbourn): Documentation
  // TODO(jelbourn): Demo that uses moment.js

  // POST RELEASE
  // TODO(jelbourn): make sure this plays well with validation and ngMessages.
  // TODO(jelbourn): calendar pane doesn't open up outside of visible viewport.
  // TODO(jelbourn): forward more attributes to the internal input (required, autofocus, etc.)
  // TODO(jelbourn): error state
  // TODO(jelbourn): something better for mobile (calendar panel takes up entire screen?)
  // TODO(jelbourn): input behavior (masking? auto-complete?)
  // TODO(jelbourn): UTC mode
  // TODO(jelbourn): RTL


  angular.module('material.components.datepicker')
      .directive('mdDatepicker', datePickerDirective);

  /**
   * @ngdoc directive
   * @name mdDatepicker
   * @module material.components.datepicker
   *
   * @param {Date} ng-model The component's model. Uses a JavaScript Date object.
   * @param {boolean=} disabled Whether the datepicker is disabled.
   *
   * @description
   * `<md-datepicker>` is a component used to select a single date.
   * For information on how to configure internationalization for the date piicker,
   * see `$mdDateLocaleProvider`.
   *
   * @usage
   * <hljs lang="html">
   *   <md-datepicker ng-model="birthday"></md-datepicker>
   * </hljs>
   *
   */
  function datePickerDirective() {
    return {
      template:
          // Buttons are not in the tab order because users can open the calendar via keyboard
          // interaction on the text input, and multiple tab stops for one component (picker)
          // may be confusing.
          '<md-button class="md-datepicker-button md-icon-button" type="button" ' +
              'tabindex="-1" aria-hidden="true" ' +
              'ng-click="ctrl.openCalendarPane($event)">' +
            '<md-icon class="md-datepicker-calendar-icon" md-svg-icon="md-calendar"></md-icon>' +
          '</md-button>' +
          '<div class="md-datepicker-input-container">' +
            '<input class="md-datepicker-input" aria-haspopup="true">' +

            '<md-button md-no-ink class="md-datepicker-triangle-button md-icon-button" ' +
                'ng-click="ctrl.openCalendarPane($event)" ' +
                'aria-label="{{::ctrl.dateLocale.msgOpenCalendar}}">' +
              '<div class="md-datepicker-expand-triangle"></div>' +
            '</md-button>' +
          '</div>' +

          // This pane will be detached from here and re-attached to the document body.
          '<div class="md-datepicker-calendar-pane md-whiteframe-z1">' +
            '<div class="md-datepicker-input-mask"></div>' +
            '<div class="md-datepicker-calendar">' +
              '<md-calendar role="dialog" aria-label="{{::ctrl.dateLocale.msgCalendar}}" ' +
                  'ng-model="ctrl.date" ng-if="ctrl.isCalendarOpen"></md-calendar>' +
            '</div>' +
          '</div>',
      require: ['ngModel', 'mdDatepicker'],
      scope: {
        placeholder: '@mdPlaceholder'
      },
      controller: DatePickerCtrl,
      controllerAs: 'ctrl',
      bindToController: true,
      link: function(scope, element, attr, controllers) {
        var ngModelCtrl = controllers[0];
        var mdDatePickerCtrl = controllers[1];

        mdDatePickerCtrl.configureNgModel(ngModelCtrl);
      }
    };
  }

  /** Additional offset for the input's `size` attribute, which is updated based on its content. */
  var EXTRA_INPUT_SIZE = 3;

  /**
   * Controller for md-datepicker.
   *
   * @ngInject @constructor
   */
  function DatePickerCtrl($scope, $element, $attrs, $compile, $timeout, $mdConstant, $mdTheming,
      $mdUtil, $mdDateLocale, $$mdDateUtil, $$rAF) {
    /** @final */
    this.$compile = $compile;

    /** @final */
    this.$timeout = $timeout;

    /** @final */
    this.dateLocale = $mdDateLocale;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.$mdConstant = $mdConstant;

    /* @final */
    this.$mdUtil = $mdUtil;

    /** @final */
    this.$$rAF = $$rAF;

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {HTMLInputElement} */
    this.inputElement = $element[0].querySelector('input');

    /** @type {HTMLElement} */
    this.inputContainer = $element[0].querySelector('.md-datepicker-input-container');

    /** @type {HTMLElement} Floating calendar pane. */
    this.calendarPane = $element[0].querySelector('.md-datepicker-calendar-pane');

    /** @type {HTMLElement} Calendar icon button. */
    this.calendarButton = $element[0].querySelector('.md-datepicker-button');

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @type {Date} */
    this.date = null;

    /** @type {boolean} */
    this.isDisabled;
    this.setDisabled($element[0].disabled || angular.isString($attrs['disabled']));

    /** @type {boolean} Whether the date-picker's calendar pane is open. */
    this.isCalendarOpen = false;

    /**
     * Element from which the calendar pane was opened. Keep track of this so that we can return
     * focus to it when the pane is closed.
     * @type {HTMLElement}
     */
    this.calendarPaneOpenedFrom = null;

    this.calendarPane.id = 'md-date-pane' + $mdUtil.nextUid();

    $mdTheming($element);

    /** Pre-bound click handler is saved so that the event listener can be removed. */
    this.bodyClickHandler = angular.bind(this, this.handleBodyClick);

    // Unless the user specifies so, the datepicker should not be a tab stop.
    // This is necessary because ngAria might add a tabindex to anything with an ng-model
    // (based on whether or not the user has turned that particular feature on/off).
    if (!$attrs['tabindex']) {
      $element.attr('tabindex', '-1');
    }

    this.installPropertyInterceptors();
    this.attachChangeListeners();
    this.attachInterationListeners();

    var self = this;
    $scope.$on('$destroy', function() {
      self.detachCalendarPane();
    });
  }

  /**
   * Sets up the controller's reference to ngModelController.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  DatePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;

    var self = this;
    ngModelCtrl.$render = function() {
      self.date = self.ngModelCtrl.$viewValue;
      self.inputElement.value = self.dateLocale.formatDate(self.date);
      self.inputElement.size = self.inputElement.value.length + EXTRA_INPUT_SIZE;
    };
  };

  /**
   * Attach event listeners for both the text input and the md-calendar.
   * Events are used instead of ng-model so that updates don't infinitely update the other
   * on a change. This should also be more performant than using a $watch.
   */
  DatePickerCtrl.prototype.attachChangeListeners = function() {
    var self = this;

    self.$scope.$on('md-calendar-change', function(event, date) {
      self.ngModelCtrl.$setViewValue(date);
      self.inputElement.value = self.dateLocale.formatDate(date);
      self.closeCalendarPane();
    });

    // TODO(jelbourn): Debounce this input event.
    self.inputElement.addEventListener('input', function() {
      var inputString = self.inputElement.value;
      var parsedDate = self.dateLocale.parseDate(inputString);

      self.inputElement.size = inputString.length + EXTRA_INPUT_SIZE;

      if (self.dateUtil.isValidDate(parsedDate) && self.dateLocale.isDateComplete(inputString)) {
        self.date = parsedDate;
        self.$scope.$apply();
      }
    });
  };

  /** Attach event listeners for user interaction. */
  DatePickerCtrl.prototype.attachInterationListeners = function() {
    var self = this;
    var $scope = this.$scope;
    var keyCodes = this.$mdConstant.KEY_CODE;

    // Add event listener through angular so that we can triggerHandler in unit tests.
    angular.element(self.inputElement).on('keydown', function(event) {
      if (event.altKey && event.keyCode == keyCodes.DOWN_ARROW) {
        self.openCalendarPane(event);
        $scope.$digest();
      }
    });

    $scope.$on('md-calendar-close', function() {
      self.closeCalendarPane();
    });
  };

  /**
   * Capture properties set to the date-picker and imperitively handle internal changes.
   * This is done to avoid setting up additional $watches.
   */
  DatePickerCtrl.prototype.installPropertyInterceptors = function() {
    var self = this;

    // Intercept disabled on the date-picker element to disable the internal input.
    // This avoids two bindings (outer scope to ctrl, ctrl to input).
    Object.defineProperty(this.$element[0], 'disabled', {
      get: function() { return self.isDisabled; },
      set: angular.bind(self, self.setDisabled)
    });

    Object.defineProperty(this, 'placeholder', {
      get: function() { return self.inputElement.placeholder },
      set: function(value) { self.inputElement.placeholder = value; }
    });
  };

  /**
   * Sets whether the date-picker is disabled.
   * @param {boolean} isDisabled
   */
  DatePickerCtrl.prototype.setDisabled = function(isDisabled) {
    this.isDisabled = isDisabled;
    this.inputElement.disabled = isDisabled;
    this.calendarButton.disabled = isDisabled;
  };

  /** Position and attach the floating calendar to the document. */
  DatePickerCtrl.prototype.attachCalendarPane = function() {
    var calendarPane = this.calendarPane;
    this.$element.addClass('md-datepicker-open');

    var elementRect = this.inputContainer.getBoundingClientRect();
    var bodyRect = document.body.getBoundingClientRect();

    calendarPane.style.left = (elementRect.left - bodyRect.left) + 'px';
    calendarPane.style.top = (elementRect.top - bodyRect.top) + 'px';
    document.body.appendChild(this.calendarPane);

    // Add CSS class after one frame to trigger open animation.
    this.$$rAF(function() {
      calendarPane.classList.add('md-pane-open');
    });
  };

  /** Detach the floating calendar pane from the document. */
  DatePickerCtrl.prototype.detachCalendarPane = function() {
    this.$element.removeClass('md-datepicker-open');
    this.calendarPane.classList.remove('md-pane-open');

    // Use native DOM removal because we do not want any of the angular state of this element
    // to be disposed.
    this.calendarPane.parentNode.removeChild(this.calendarPane);
  };

  /**
   * Open the floating calendar pane.
   * @param {Event} event
   */
  DatePickerCtrl.prototype.openCalendarPane = function(event) {
    if (!this.isCalendarOpen && !this.isDisabled) {
      this.isCalendarOpen = true;
      this.calendarPaneOpenedFrom = event.target;
      this.attachCalendarPane();
      this.focusCalendar();

      // Because the calendar pane is attached directly to the body, it is possible that the
      // rest of the component (input, etc) is in a different scrolling container, such as
      // an md-content. This means that, if the container is scrolled, the pane would remain
      // stationary. To remedy this, we disable scrolling while the calendar pane is open, which
      // also matches the native behavior for things like `<select>` on Mac and Windows.
      this.$mdUtil.disableScrollAround(this.calendarPane);

      // Attach click listener inside of a timeout because, if this open call was triggered by a
      // click, we don't want it to be immediately propogated up to the body and handled.
      var self = this;
      this.$mdUtil.nextTick(function() {
        document.body.addEventListener('click', self.bodyClickHandler);
      }, false);
    }
  };

  /** Close the floating calendar pane. */
  DatePickerCtrl.prototype.closeCalendarPane = function() {
    this.isCalendarOpen = false;
    this.detachCalendarPane();
    this.calendarPaneOpenedFrom.focus();
    this.calendarPaneOpenedFrom = null;
    this.$mdUtil.enableScrolling();

    document.body.removeEventListener('click', this.bodyClickHandler);
  };

  /** Gets the controller instance for the calendar in the floating pane. */
  DatePickerCtrl.prototype.getCalendarCtrl = function() {
    return angular.element(this.calendarPane.querySelector('md-calendar')).controller('mdCalendar');
  };

  /** Focus the calendar in the floating pane. */
  DatePickerCtrl.prototype.focusCalendar = function() {
    // Use a timeout in order to allow the calendar to be rendered, as it is gated behind an ng-if.
    var self = this;
    this.$mdUtil.nextTick(function() {
      self.getCalendarCtrl().focus();
    }, false);
  };

  /**
   * Handles a click on the document body when the floating calendar pane is open.
   * Closes the floating calendar pane if the click is not inside of it.
   * @param {MouseEvent} event
   */
  DatePickerCtrl.prototype.handleBodyClick = function(event) {
    if (this.isCalendarOpen) {
      // TODO(jelbourn): way want to also include the md-datepicker itself in this check.
      var isInCalendar = this.$mdUtil.getClosest(event.target, 'md-calendar');
      if (!isInCalendar) {
        this.closeCalendarPane();
      }

      this.$scope.$digest();
    }
  };
})();
