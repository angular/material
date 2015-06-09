(function() {
  'use strict';

  // PRE RELEASE
  // TODO(jelbourn): aria attributes tying together date input and floating calendar.
  // TODO(jelbourn): actual calendar icon next to input
  // TODO(jelbourn): something for mobile (probably calendar panel should take up entire screen)
  // TODO(jelbourn): style to match specification
  // TODO(jelbourn): make sure this plays well with validation and ngMessages.
  // TODO(jelbourn): forward more attributes to the internal input (required, autofocus, etc.)
  // TODO(jelbourn): floating panel open animation (see animation for menu in spec).
  // TODO(jelbourn): error state

  // FUTURE VERSION
  // TODO(jelbourn): input behavior (masking? auto-complete?)
  // TODO(jelbourn): UTC mode
  // TODO(jelbourn): RTL


  angular.module('material.components.calendar')
      .directive('mdDatePicker', datePickerDirective);

  function datePickerDirective() {
    return {
      template:
          '<md-button class="md-date-picker-button md-icon-button" type="button" ' +
              'ng-click="ctrl.openCalendarPane()">📅</md-button>' +
          '<div class="md-datepicker-input-container">' +
            '<input class="md-datepicker-input">' +
          '</div>' +

          // This pane (and its shadow) will be detached from here and re-attached to the
          // document body.
          '<div class="md-date-calendar-pane">' +
            '<md-calendar ng-model="ctrl.date" ng-if="ctrl.isCalendarOpen"></md-calendar>' +
          '</div>' +

          // We have a separate shadow element in order to wrap both the floating pane and the
          // inline input / trigger as one shadowed whole.
          '<div class="md-date-calendar-pane-shadow md-whiteframe-z1"></div>',
      require: ['ngModel', 'mdDatePicker'],
      scope: {},
      controller: DatePickerCtrl,
      controllerAs: 'ctrl',
      link: function(scope, element, attr, controllers) {
        var ngModelCtrl = controllers[0];
        var mdDatePickerCtrl = controllers[1];

        mdDatePickerCtrl.configureNgModel(ngModelCtrl);

        // DEBUG
        window.dCtrl = mdDatePickerCtrl;
      }
    };
  }

  /**
   * Controller for md-date-picker.
   *
   * @ngInject @constructor
   */
  function DatePickerCtrl($scope, $element, $compile, $timeout, $mdConstant, $mdUtil,
      $$mdDateLocale, $$mdDateUtil) {
    /** @final */
    this.$compile = $compile;

    /** @final */
    this.$timeout = $timeout;

    /** @final */
    this.dateLocale = $$mdDateLocale;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.$mdConstant = $mdConstant;

    /* @final */
    this.$mdUtil = $mdUtil;

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {HTMLInputElement} */
    this.inputElement = $element[0].querySelector('input');

    /** @type {HTMLElement} */
    this.inputContainer = $element[0].querySelector('.md-datepicker-input-container');

    /** @type {HTMLElement} Floating calendar pane. */
    this.calendarPane = $element[0].querySelector('.md-date-calendar-pane');

    /** @type {HTMLElement} Shadow for floating calendar pane and input trigger. */
    this.calendarShadow = $element[0].querySelector('.md-date-calendar-pane-shadow');

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @type {Date} */
    this.date = null;

    /** @type {boolean} */
    this.isDisabled;
    this.setDisabled($element[0].disabled);

    /** @type {boolean} Whether the date-picker's calendar pane is open. */
    this.isCalendarOpen = false;

    /** Pre-bound click handler is saved so that the event listener can be removed. */
    this.bodyClickHandler = this.handleBodyClick.bind(this);

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
      if (self.dateUtil.isValidDate(parsedDate)) {
        // TODO(jelbourn): if we can detect here that `inputString` is a "complete" date,
        // set the ng-model value.

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

    self.inputElement.addEventListener('keydown', function(event) {
      $scope.$apply(function() {
        if (event.altKey && event.keyCode == keyCodes.DOWN_ARROW) {
          self.openCalendarPane();
        }
      });
    });

    self.$scope.$on('md-calendar-escape', function() {
      self.closeCalendarPane();
    });
  };

  /** Capture properties set to the date-picker and imperitively handle internal changes. */
  DatePickerCtrl.prototype.installPropertyInterceptors = function() {
    var self = this;

    // Intercept disabled on the date-picker element to disable the internal input.
    // This avoids two bindings (outer scope to ctrl, ctrl to input).
    Object.defineProperty(this.$element[0], 'disabled', {
      get: function() { return self.isDisabled; },
      set: function(value) { self.setDisabled(value) }
    });
  };

  /**
   * Sets whether the date-picker is disabled.
   * @param {boolean} isDisabled
   */
  DatePickerCtrl.prototype.setDisabled = function(isDisabled) {
    this.isDisabled = isDisabled;
    this.inputElement.disabled = isDisabled;
  };

  /** Position and attach the floating calendar to the document. */
  DatePickerCtrl.prototype.attachCalendarPane = function() {
    this.inputContainer.classList.add('md-open');
    var elementRect = this.inputContainer.getBoundingClientRect();

    this.calendarPane.style.left = (elementRect.left + window.pageXOffset) + 'px';
    this.calendarPane.style.top = (elementRect.bottom + window.pageYOffset) + 'px';
    document.body.appendChild(this.calendarPane);

    // Add shadow to the calendar pane only after the UI thread has reached idle, allowing the
    // content of the calender pane to be rendered.
    this.$timeout(function() {
      this.calendarShadow.style.top = (elementRect.top + window.pageYOffset) + 'px';
      this.calendarShadow.style.left = this.calendarPane.style.left;
      this.calendarShadow.style.height =
          (this.calendarPane.getBoundingClientRect().bottom - elementRect.top) + 'px';
      document.body.appendChild(this.calendarShadow);
    }.bind(this), 0, false);
  };

  /** Detach the floating calendar pane from the document. */
  DatePickerCtrl.prototype.detachCalendarPane = function() {
    this.inputContainer.classList.remove('md-open');
    // Use native DOM removal because we do not want any of the angular state of this element
    // to be disposed.
    this.calendarPane.parentNode.removeChild(this.calendarPane);
    this.calendarShadow.parentNode.removeChild(this.calendarShadow);
  };

  /** Open the floating calendar pane. */
  DatePickerCtrl.prototype.openCalendarPane = function() {
    if (!this.isCalendarOpen) {
      this.isCalendarOpen = true;
      this.attachCalendarPane();
      this.focusCalendar();

      // Attach click listener inside of a timeout because, if this open call was triggered by a
      // click, we don't want it to be immediately propogated up to the body and handled.
      var self = this;
      this.$timeout(function() {
        document.body.addEventListener('click', self.bodyClickHandler);
      }, 0, false);
    }
  };

  /** Close the floating calendar pane. */
  DatePickerCtrl.prototype.closeCalendarPane = function() {
    this.isCalendarOpen = false;
    this.detachCalendarPane();
    this.inputElement.focus();
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
    this.$timeout(function() {
      self.getCalendarCtrl().focus();
    }, 0, false);
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
