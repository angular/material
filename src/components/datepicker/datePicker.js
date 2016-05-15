(function() {
  'use strict';

  // POST RELEASE
  // TODO(jelbourn): Demo that uses moment.js
  // TODO(jelbourn): make sure this plays well with validation and ngMessages.
  // TODO(jelbourn): calendar pane doesn't open up outside of visible viewport.
  // TODO(jelbourn): forward more attributes to the internal input (required, autofocus, etc.)
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
   * @param {Date} ng-model The component's model. Expects a JavaScript Date object.
   * @param {Date} md-start-date The start date of a date range. Expects a JavaScript Date object.
   * @param {Date} md-end-date The end date of a date range. Expects a JavaScript Date object.
   * @param {expression=} ng-change Expression evaluated when the model value changes.
   * @param {Date=} md-min-date Expression representing a min date (inclusive).
   * @param {Date=} md-max-date Expression representing a max date (inclusive).
   * @param {(function(Date): boolean)=} md-date-filter Function expecting a date and returning a boolean whether it can be selected or not.
   * @param {String=} md-placeholder The date input placeholder value.
   * @param {String=} md-placeholder-start The start date input placeholder value.
   * @param {String=} md-placeholder-end The end date input placeholder value.
   * @param {boolean=} ng-disabled Whether the datepicker is disabled.
   * @param {boolean=} ng-required Whether a value is required for the datepicker.
   *
   * @description
   * `<md-datepicker>` is a component used to select a single date or date range
   * For information on how to configure internationalization for the date picker,
   * see `$mdDateLocaleProvider`.
   *
   * This component supports [ngMessages](https://docs.angularjs.org/api/ngMessages/directive/ngMessages).
   * Supported attributes are:
   * * `required`: whether a required date is not set.
   * * `mindate`: whether the selected date is before the minimum allowed date.
   * * `maxdate`: whether the selected date is after the maximum allowed date.
   *
   * @usage
   * <hljs lang="html">
   *   <md-datepicker ng-model="birthday"></md-datepicker>
   *   or
   *   <md-datepicker md-start-date="someStartDate" md-end-date="endDate"></md-datepicker>
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
          '<div class="md-datepicker-input-container" ' +
              'ng-class="{\'md-datepicker-focused\': ctrl.isFocused}">' +
            '<input class="md-datepicker-input md-datepicker-start-date" aria-haspopup="true" ' +
                'ng-focus="ctrl.setStartDateFocused(true)" ng-blur="ctrl.setStartDateFocused(false)">' +
            '<input ng-show="ctrl.startDate && ctrl.endDate" class="md-datepicker-input md-datepicker-end-date" ' +
                'aria-haspopup="true" ng-focus="ctrl.setEndDateFocused(true)" ' +
                'ng-blur="ctrl.setEndDateFocused(false)">' +
            '<md-button type="button" md-no-ink ' +
                'class="md-datepicker-triangle-button md-icon-button" ' +
                'ng-click="ctrl.openCalendarPane($event)" ' +
                'aria-label="{{::ctrl.dateLocale.msgOpenCalendar}}">' +
              '<div class="md-datepicker-expand-triangle"></div>' +
            '</md-button>' +
          '</div>' +

          // This pane will be detached from here and re-attached to the document body.
          '<div class="md-datepicker-calendar-pane md-whiteframe-z1">' +
            '<div class="md-datepicker-input-mask">' +
              '<div class="md-datepicker-input-mask-opaque"></div>' +
            '</div>' +
            '<div class="md-datepicker-calendar">' +
              '<md-calendar role="dialog" aria-label="{{::ctrl.dateLocale.msgCalendar}}" ' +
                  'md-min-date="ctrl.minDate" md-max-date="ctrl.maxDate"' +
                  'md-date-filter="ctrl.dateFilter"' +
                  'ng-model="ctrl.date" ng-if="ctrl.isCalendarOpen">' +
              '</md-calendar>' +
            '</div>' +
          '</div>',
      require: ['?ngModel', 'mdDatepicker', '?^mdInputContainer'],
      scope: {
        minDate: '=mdMinDate',
        maxDate: '=mdMaxDate',
        start: '=mdStartDate',
        end: '=mdEndDate',
        placeholder: '@mdPlaceholder',
        placeholderStart: '@mdPlaceholderStart',
        placeholderEnd: '@mdPlaceholderEnd',
        dateFilter: '=mdDateFilter'
      },
      controller: DatePickerCtrl,
      controllerAs: 'ctrl',
      bindToController: true,
      link: function(scope, element, attr, controllers) {
        if (controllers[1] != null) {
          var ngModelCtrl = controllers[0];
          var mdDatePickerCtrl = controllers[1];

          var mdInputContainer = controllers[2];
          if (mdInputContainer) {
            throw Error('md-datepicker should not be placed inside md-input-container.');
          }

          mdDatePickerCtrl.configureNgModel(ngModelCtrl, scope);
        }
      }
    };
  }

  /** Additional offset for the input's `size` attribute, which is updated based on its content. */
  var EXTRA_INPUT_SIZE = 3;

  /** Class applied to the container if the date is invalid. */
  var INVALID_CLASS = 'md-datepicker-invalid';

  /** Default time in ms to debounce input event by. */
  var DEFAULT_DEBOUNCE_INTERVAL = 500;

  /**
   * Height of the calendar pane used to check if the pane is going outside the boundary of
   * the viewport. See calendar.scss for how $md-calendar-height is computed; an extra 20px is
   * also added to space the pane away from the exact edge of the screen.
   *
   *  This is computed statically now, but can be changed to be measured if the circumstances
   *  of calendar sizing are changed.
   */
  var CALENDAR_PANE_HEIGHT = 368;

  /**
   * Width of the calendar pane used to check if the pane is going outside the boundary of
   * the viewport. See calendar.scss for how $md-calendar-width is computed; an extra 20px is
   * also added to space the pane away from the exact edge of the screen.
   *
   *  This is computed statically now, but can be changed to be measured if the circumstances
   *  of calendar sizing are changed.
   */
  var CALENDAR_PANE_WIDTH = 360;

  /**
   * Controller for md-datepicker.
   *
   * @ngInject @constructor
   */
  function DatePickerCtrl($scope, $element, $attrs, $compile, $timeout, $window,
      $mdConstant, $mdTheming, $mdUtil, $mdDateLocale, $$mdDateUtil, $$rAF) {
    /** @final */
    this.$compile = $compile;

    /** @final */
    this.$timeout = $timeout;

    /** @final */
    this.$window = $window;

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

    /**
     * The root document element. This is used for attaching a top-level click handler to
     * close the calendar panel when a click outside said panel occurs. We use `documentElement`
     * instead of body because, when scrolling is disabled, some browsers consider the body element
     * to be completely off the screen and propagate events directly to the html element.
     * @type {!angular.JQLite}
     */
    this.documentElement = angular.element(document.documentElement);

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {HTMLInputElement} */
    this.inputElement = $element[0].querySelector('.md-datepicker-start-date');

    /** @final {!angular.JQLite} */
    this.ngInputElement = angular.element(this.inputElement);

    /** @type {HTMLInputElement} */
    this.startInputElement = $element[0].querySelector('.md-datepicker-start-date');

    /** @final {!angular.JQLite} */
    this.ngStartInputElement = angular.element(this.startInputElement);

    /** @type {HTMLInputElement} */
    this.endInputElement = $element[0].querySelector('.md-datepicker-end-date');

    /** @final {!angular.JQLite} */
    this.ngEndInputElement = angular.element(this.endInputElement);

    /** @type {HTMLElement} */
    this.inputContainer = $element[0].querySelector('.md-datepicker-input-container');

    /** @type {HTMLElement} Floating calendar pane. */
    this.calendarPane = $element[0].querySelector('.md-datepicker-calendar-pane');

    /** @type {HTMLElement} Calendar icon button. */
    this.calendarButton = $element[0].querySelector('.md-datepicker-button');

    /**
     * Element covering everything but the input in the top of the floating calendar pane.
     * @type {HTMLElement}
     */
    this.inputMask = $element[0].querySelector('.md-datepicker-input-mask-opaque');

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Attributes} */
    this.$attrs = $attrs;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @type {Date} */
    this.date = null;

    /**
     * This variable is used within the date-range-picker context and serves as an intermediate start date value
     * holder for value validation, filtering, etc. between the md-datepicker and the md-calendar directives.
     * @type {Date}
     */
    this.startDate = null;

    /**
     * This variable is used within the date-range-picker context and serves as an intermediate end date value
     * holder for value validation, filtering, etc. between the md-datepicker and the md-calendar directives.
     * @type {Date}
     */
    this.endDate = null;

    /**
     * This variable serves a similar purpose within the date-range-picker context, as ngModel.$viewValue does within
     * the date-picker context: it represents the string value of the start date.
     * @type {string}
     */
    this.startDateViewValue = null;

    /**
     * This variable serves a similar purpose within the date-range-picker context, as ngModel.$viewValue does within
     * the date-picker context: it represents the string value of the end date.
     * @type {string}
     */
    this.endDateViewValue = null;

    /**
     * This variable serves a similar purpose within the date-range-picker context, as ngModel.$valid does within
     * the date-picker context: it represents the validity of the start and end dates within a date range.
     * @type {Object}
     */
    this.dateRangeValidity = {
      valid: true
    };

    /**
     * This variable serves a similar purpose within the date-range-picker context, as ngModel.$valid does within
     * the date-picker context: it serves as a dirty flag for the start date within the date range.
     * @type {boolean}
     */
    this.isBeginDateTouched = false;

    /**
     * This variable serves a similar purpose within the date-range-picker context, as ngModel.$valid does within
     * the date-picker context: it serves as a dirty flag for the end date within the date range.
     * @type {boolean}
     */
    this.isEndDateTouched = false;

    /** @type {boolean} */
    this.isFocused = false;

    /** @type {boolean} */
    this.isDisabled;
    this.setDisabled($element[0].disabled || angular.isString($attrs['disabled']));

    /**
     * Whether the date-picker's calendar pane is open.
     * @type {boolean}
     */
    this.isCalendarOpen = false;

    /**
     * Whether or not the datepicker is being used as a date-range picker.
     * @type {boolean}
     */
    this.isDateRange = $element[0].hasAttribute('md-end-date');

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

    /** Pre-bound resize handler so that the event listener can be removed. */
    this.windowResizeHandler = $mdUtil.debounce(angular.bind(this, this.closeCalendarPane), 100);

    // Unless the user specifies so, the datepicker should not be a tab stop.
    // This is necessary because ngAria might add a tabindex to anything with an ng-model
    // (based on whether or not the user has turned that particular feature on/off).
    if (!$attrs['tabindex']) {
      $element.attr('tabindex', '-1');
    }

    this.installPropertyInterceptors();
    this.attachChangeListeners();
    this.attachInteractionListeners();

    var self = this;
    $scope.$on('$destroy', function() {
      self.detachCalendarPane();
    });
  }

  /**
   * Sets up the controller's references depending on the directive's context.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  DatePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    var self = this;
    var datePickerContext = ngModelCtrl != null && self.start == undefined && self.end == undefined;
    var dateRangePickerContext = ngModelCtrl == null && self.start != undefined && self.end != undefined;

    if (!datePickerContext && !dateRangePickerContext) {
      throw Error('Either the ng-model must be specified (for datepicker behavior) OR both the md-start-date and ' +
        'md-end-date must be specified (for date-range behavior).');
    }

    if (!self.isDateRange) {
      self.configureNgModelForDatePicker(ngModelCtrl)
    } else {
      self.configureNgModelForDateRangePicker();
    }
  };

  /**
   * Sets up the controller's reference to ngModelController for the date picker context.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  DatePickerCtrl.prototype.configureNgModelForDatePicker = function(ngModelCtrl) {
    var self = this;

    self.ngModelCtrl = ngModelCtrl;
    ngModelCtrl.$render = function() {
      var value = self.ngModelCtrl.$viewValue;

      if (value && !(value instanceof Date)) {
        throw Error('The ng-model for md-datepicker must be a Date instance. ' +
            'Currently the model is a: ' + (typeof value));
      }

      self.date = value;
      self.inputElement.value = self.dateLocale.formatDate(value);

      self.configurePicker();
    };
  };

  /**
   * Sets up the controller's reference to the date range start/end date models date range picker context.
   */
  DatePickerCtrl.prototype.configureNgModelForDateRangePicker = function() {
    var self = this;

    var startDateValue, endDateValue;

    self.$scope.$watchGroup(['ctrl.start', 'ctrl.end'], function(newValues, oldValues, s) {
      self.startDate = newValues[0];
      self.endDate = newValues[1];

      self.setBeginDateViewValue(newValues[0]);
      self.setEndDateViewValue(newValues[1]);

      self.setDateRangeValidity('', true);

      startDateValue = self.startDate;
      endDateValue = self.endDate;

      if (!(startDateValue instanceof Date) || !(endDateValue instanceof Date)) {
        throw Error('For date-range picker behavior, a Date instance for both ' +
            'the md-start-date and the md-end-date must be specified. Currently md-start-date value is ' +
            startDateValue + 'and the md-end-date value is ' + endDateValue);
      }

      self.startDate = startDateValue;
      self.endDate = endDateValue;
      self.startInputElement.value = self.dateLocale.formatDate(startDateValue);
      self.endInputElement.value = self.dateLocale.formatDate(endDateValue);

      self.configurePicker();
    });
  };

  /**
   * Configures the Input Element(s) for the picker.
   */
  DatePickerCtrl.prototype.configurePicker = function() {
    var self = this;

    self.resizeInputElement();
    self.updateErrorState();
  };

  /**
   * Configure event listeners depending on the directive's context.
   */
  DatePickerCtrl.prototype.attachChangeListeners = function() {
    var self = this;

    if (!self.isDateRange) {
      self.attachDatePickerChangeListeners();
    } else {
      self.attachDateRangePickerChangeListeners();
    }
  };

  /**
   * Attach event listeners for both the text input and the md-calendar.
   * Events are used instead of ng-model so that updates don't infinitely update the other
   * on a change. This should also be more performant than using a $watch.
   */
  DatePickerCtrl.prototype.attachDatePickerChangeListeners = function() {
    var self = this;

    self.$scope.$on('md-calendar-change', function(event, date) {
      self.ngModelCtrl.$setViewValue(date);
      self.date = date;
      self.inputElement.value = self.dateLocale.formatDate(date);
      self.closeCalendarPane();
      self.resizeInputElement();
      self.updateErrorState();
    });

    self.ngInputElement.on('input', angular.bind(self, self.resizeInputElement));
    // TODO(chenmike): Add ability for users to specify this interval.
    self.ngInputElement.on('input', self.$mdUtil.debounce(self.handleInputEvent,
        DEFAULT_DEBOUNCE_INTERVAL, self));
  };

  /**
   * Setup event listener for both of the start/end date text inputs and the md-calendar.
   */
  DatePickerCtrl.prototype.attachDateRangePickerChangeListeners = function() {
    var self = this;

    //TODO(sueinh): Update the md-calendar directive controller to emit the md-calendar-range-change event when a date range change occurs
    self.$scope.$on('md-calendar-change', function(event, date, type) {
      // TODO(sueinh): Adding hard coded flag temporarily to prevent errors. Remove this hard coded flag once the md-calendar emit change has been made.
      type = 'start';
      if (type) {
        if (type == 'start') {
          self.setBeginDateViewValue(date);
          self.startDate = date;
          self.startInputElement.value = self.dateLocale.formatDate(date);
          self.closeCalendarPane();
          self.resizeInputElement();
          self.updateErrorState();

          self.ngStartInputElement.on('input', angular.bind(self, self.resizeInputElement));
          // TODO(chenmike): Add ability for users to specify this interval.
          self.ngStartInputElement.on('input', self.$mdUtil.debounce(self.handleInputEvent,
              DEFAULT_DEBOUNCE_INTERVAL, self));
        } else {
          self.setEndDateViewValue(date);
          self.endDate = date;
          self.endInputElement.value = self.dateLocale.formatDate(date);
          self.closeCalendarPane();
          self.resizeInputElement();
          self.updateErrorState();

          self.ngEndInputElement.on('input', angular.bind(self, self.resizeInputElement));
          // TODO(chenmike): Add ability for users to specify this interval.
          self.ngEndInputElement.on('input', self.$mdUtil.debounce(self.handleInputEvent,
              DEFAULT_DEBOUNCE_INTERVAL, self));
        }
      }
    });
  };

  /** Attach event listeners for user interaction. */
  DatePickerCtrl.prototype.attachInteractionListeners = function() {
    var self = this;
    var $scope = this.$scope;
    var keyCodes = this.$mdConstant.KEY_CODE;
    var keyDownEventHandler = function(event) {
      if (event.altKey && event.keyCode == keyCodes.DOWN_ARROW) {
        self.openCalendarPane(event);
        $scope.$digest();
      }
    };

    if (!self.isDateRange) {
      // Add event listener through angular so that we can triggerHandler in unit tests.
      self.ngInputElement.on('keydown', keyDownEventHandler);
    } else {
      // Add event listeners through angular so that we can triggerHandler in unit tests.
      self.ngStartInputElement.on('keydown', keyDownEventHandler);

      self.ngEndInputElement.on('keydown', keyDownEventHandler);
    }

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

    if (this.$attrs['ngDisabled']) {
      // The expression is to be evaluated against the directive element's scope and not
      // the directive's isolate scope.
      var scope = this.$scope.$parent;

      if (scope) {
        scope.$watch(this.$attrs['ngDisabled'], function(isDisabled) {
          self.setDisabled(isDisabled);
        });
      }
    }

    if (!self.isDateRange) {
      Object.defineProperty(this, 'placeholder', {
        get: function() { return self.inputElement.placeholder; },
        set: function(value) { self.inputElement.placeholder = value || ''; }
      });
    } else {
      Object.defineProperty(this, 'placeholderBegin', {
        get: function() { return self.startInputElement.placeholder; },
        set: function(value) { self.startInputElement.placeholder = value || ''; }
      });
      Object.defineProperty(this, 'placeholderEnd', {
        get: function() { return self.endInputElement.placeholder; },
        set: function(value) { self.endInputElement.placeholder = value || ''; }
      });
    }
  };

  /**
   * Sets whether the date-picker is disabled.
   * @param {boolean} isDisabled
   */
  DatePickerCtrl.prototype.setDisabled = function(isDisabled) {
    this.isDisabled = isDisabled;
    if (!this.isDateRange) {
      this.inputElement.disabled = isDisabled;
    } else {
      this.startInputElement.disabled = isDisabled;
      this.endInputElement.disabled = isDisabled;
    }
    this.calendarButton.disabled = isDisabled;
  };

  /**
   * Sets the custom ngModel.$error flags to be consumed by ngMessages. Flags are:
   *   - mindate: whether the selected date is before the minimum date.
   *   - maxdate: whether the selected flag is after the maximum date.
   *   - filtered: whether the selected date is allowed by the custom filtering function.
   *   - valid: whether the entered text input is a valid date
   *
   * The 'required' flag is handled automatically by ngModel.
   *
   * @param {Date=} opt_date Date to check. If not given, defaults to the datepicker's model value.
   * @param {Date=} opt_start_date Date to check. If not given, defaults to the datepicker's start date value.
   * @param {Date=} opt_end_date Date to check. If not given, defaults to the datepicker's end date value.
   */
  DatePickerCtrl.prototype.updateErrorState = function(opt_date, opt_start_date, opt_end_date) {
    if (!this.isDateRange) {
      var date = opt_date || this.date;

      // Clear any existing errors to get rid of anything that's no longer relevant.
      this.clearErrorState();

      if (this.dateUtil.isValidDate(date)) {
        // Force all dates to midnight in order to ignore the time portion.
        date = this.dateUtil.createDateAtMidnight(date);

        if (this.dateUtil.isValidDate(this.minDate)) {
          var minDate = this.dateUtil.createDateAtMidnight(this.minDate);
          this.ngModelCtrl.$setValidity('mindate', date >= minDate);
        }

        if (this.dateUtil.isValidDate(this.maxDate)) {
          var maxDate = this.dateUtil.createDateAtMidnight(this.maxDate);
          this.ngModelCtrl.$setValidity('maxdate', date <= maxDate);
        }

        if (angular.isFunction(this.dateFilter)) {
          this.ngModelCtrl.$setValidity('filtered', this.dateFilter(date));
        }
      } else {
        // The date is seen as "not a valid date" if there is *something* set
        // (i.e.., not null or undefined), but that something isn't a valid date.
        this.ngModelCtrl.$setValidity('valid', date == null);
      }

      // TODO(jelbourn): Change this to classList.toggle when we stop using PhantomJS in unit tests
      // because it doesn't conform to the DOMTokenList spec.
      // See https://github.com/ariya/phantomjs/issues/12782.
      if (!this.ngModelCtrl.$valid) {
        this.inputContainer.classList.add(INVALID_CLASS);
      }
    } else {
      var startDate = opt_start_date || this.startDate;
      var endDate = opt_end_date || this.endDate;

      // Clear any existing errors to get rid of anything that's no longer relevant.
      this.clearErrorState();

      if (this.dateUtil.isValidDate(startDate) && this.dateUtil.isValidDate(endDate)) {
        // Force all dates to midnight in order to ignore the time portion.
        startDate = this.dateUtil.createDateAtMidnight(startDate);
        endDate = this.dateUtil.createDateAtMidnight(endDate);

        if (this.dateUtil.isValidDate(this.minDate)) {
          var minDate = this.dateUtil.createDateAtMidnight(this.minDate);
          this.setDateRangeValidity('mindate', startDate >= minDate);
        }

        if (this.dateUtil.isValidDate(this.maxDate)) {
          var maxDate = this.dateUtil.createDateAtMidnight(this.maxDate);
          this.setDateRangeValidity('maxdate', endDate <= maxDate);
        }

        if (angular.isFunction(this.dateFilter)) {
          if (this.dateFilter(startDate) && this.dateFilter(endDate)) {
            this.setDateRangeValidity('filtered', true);
          } else {
            this.setDateRangeValidity('filtered', false);
          }
        }
      } else {
        // The date range is seen as "not a valid date range" if there is *something* set
        // (i.e.., not null or undefined), but that something isn't a valid date range.
        this.setDateRangeValidity('valid', startDate == null && endDate == null);
      }

      if (!this.getDateRangeValidity().valid) {
        this.inputContainer.classList.add(INVALID_CLASS);
      }
    }
  };

  /** Clears any error flags set by `updateErrorState`. */
  DatePickerCtrl.prototype.clearErrorState = function() {
    var errorStates = ['mindate', 'maxdate', 'filtered', 'valid'];
    this.inputContainer.classList.remove(INVALID_CLASS);
    if (!this.isDateRange) {
      errorStates.forEach(function(field) {
        this.ngModelCtrl.$setValidity(field, true);
      }, this);
    } else {
      errorStates.forEach(function(field) {
        this.setDateRangeValidity(field, true);
      }, this);
    }
  };

  /** Resizes the input element based on the size of its content. */
  DatePickerCtrl.prototype.resizeInputElement = function() {
    if (!this.isDateRange) {
      this.inputElement.size = this.inputElement.value.length + EXTRA_INPUT_SIZE;
    } else {
      this.startInputElement.size = this.startInputElement.value.length + EXTRA_INPUT_SIZE / 2;
      this.endInputElement.size = this.endInputElement.value.length + EXTRA_INPUT_SIZE / 2;
    }
  };

  /**
   * Sets the model value if the user input is a valid date.
   * Adds an invalid class to the input element if not.
   */
  DatePickerCtrl.prototype.handleInputEvent = function() {
    if (!this.isDateRange) {
      var inputString = this.inputElement.value;
      var parsedDate = inputString ? this.dateLocale.parseDate(inputString) : null;
      this.dateUtil.setDateTimeToMidnight(parsedDate);

      // An input string is valid if it is either empty (representing no date)
      // or if it parses to a valid date that the user is allowed to select.
      var isValidInput = inputString == '' || (
          this.dateUtil.isValidDate(parsedDate) &&
          this.dateLocale.isDateComplete(inputString) &&
          this.isDateEnabled(parsedDate)
        );

      // The datepicker's model is only updated when there is a valid input.
      if (isValidInput) {
        this.ngModelCtrl.$setViewValue(parsedDate);
        this.date = parsedDate;
      }

      this.updateErrorState(parsedDate);
    } else {
      var startInputString = this.startInputElement.value;
      var endInputString = this.endInputElement.value;
      var startParsedDate = startInputString ? this.dateLocale.parseDate(startInputString) : null;
      var endParsedDate = endInputString ? this.dateLocale.parseDate(endInputString) : null;
      this.dateUtil.setDateTimeToMidnight(startParsedDate);
      this.dateUtil.setDateTimeToMidnight(endParsedDate);

      // The input strings are valid if the are either empty (representing no date range)
      // or if they parses to a valid date range that the user is allowed to select.
      var isBeginValidInput = startInputString == '' || (
          this.dateUtil.isValidDate(startParsedDate) &&
          this.dateLocale.isDateComplete(startInputString) &&
          this.isDateEnabled(startParsedDate)
        );

      var isEndValidInput = endInputString == '' || (
          this.dateUtil.isValidDate(endParsedDate) &&
          this.dateLocale.isDateComplete(startInputString) &&
          this.isDateEnabled(endParsedDate)
        );

      var isValidInput = isBeginValidInput && isEndValidInput;

      if (isValidInput) {
        this.setBeginDateViewValue(startParsedDate);
        this.setEndDateViewValue(endParsedDate);
        this.startDate = startParsedDate;
        this.endDate = endParsedDate;
      }

      this.updateErrorState(null, startParsedDate, endParsedDate);
    }
  };

  /**
   * Check whether date is in range and enabled
   * @param {Date=} opt_date
   * @return {boolean} Whether the date is enabled.
   */
  DatePickerCtrl.prototype.isDateEnabled = function(opt_date) {
    return this.dateUtil.isDateWithinRange(opt_date, this.minDate, this.maxDate) &&
          (!angular.isFunction(this.dateFilter) || this.dateFilter(opt_date));
  };

  /** Position and attach the floating calendar to the document. */
  DatePickerCtrl.prototype.attachCalendarPane = function() {
    var calendarPane = this.calendarPane;
    calendarPane.style.transform = '';
    this.$element.addClass('md-datepicker-open');

    var elementRect = this.inputContainer.getBoundingClientRect();
    var bodyRect = document.body.getBoundingClientRect();

    // Check to see if the calendar pane would go off the screen. If so, adjust position
    // accordingly to keep it within the viewport.
    var paneTop = elementRect.top - bodyRect.top;
    var paneLeft = elementRect.left - bodyRect.left;

    // If ng-material has disabled body scrolling (for example, if a dialog is open),
    // then it's possible that the already-scrolled body has a negative top/left. In this case,
    // we want to treat the "real" top as (0 - bodyRect.top). In a normal scrolling situation,
    // though, the top of the viewport should just be the body's scroll position.
    var viewportTop = (bodyRect.top < 0 && document.body.scrollTop == 0) ?
        -bodyRect.top :
        document.body.scrollTop;

    var viewportLeft = (bodyRect.left < 0 && document.body.scrollLeft == 0) ?
        -bodyRect.left :
        document.body.scrollLeft;

    var viewportBottom = viewportTop + this.$window.innerHeight;
    var viewportRight = viewportLeft + this.$window.innerWidth;

    // If the right edge of the pane would be off the screen and shifting it left by the
    // difference would not go past the left edge of the screen. If the calendar pane is too
    // big to fit on the screen at all, move it to the left of the screen and scale the entire
    // element down to fit.
    if (paneLeft + CALENDAR_PANE_WIDTH > viewportRight) {
      if (viewportRight - CALENDAR_PANE_WIDTH > 0) {
        paneLeft = viewportRight - CALENDAR_PANE_WIDTH;
      } else {
        paneLeft = viewportLeft;
        var scale = this.$window.innerWidth / CALENDAR_PANE_WIDTH;
        calendarPane.style.transform = 'scale(' + scale + ')';
      }

      calendarPane.classList.add('md-datepicker-pos-adjusted');
    }

    // If the bottom edge of the pane would be off the screen and shifting it up by the
    // difference would not go past the top edge of the screen.
    if (paneTop + CALENDAR_PANE_HEIGHT > viewportBottom &&
        viewportBottom - CALENDAR_PANE_HEIGHT > viewportTop) {
      paneTop = viewportBottom - CALENDAR_PANE_HEIGHT;
      calendarPane.classList.add('md-datepicker-pos-adjusted');
    }

    calendarPane.style.left = paneLeft + 'px';
    calendarPane.style.top = paneTop + 'px';
    document.body.appendChild(calendarPane);

    // The top of the calendar pane is a transparent box that shows the text input underneath.
    // Since the pane is floating, though, the page underneath the pane *adjacent* to the input is
    // also shown unless we cover it up. The inputMask does this by filling up the remaining space
    // based on the width of the input.
    this.inputMask.style.left = elementRect.width + 'px';

    // Add CSS class after one frame to trigger open animation.
    this.$$rAF(function() {
      calendarPane.classList.add('md-pane-open');
    });
  };

  /** Detach the floating calendar pane from the document. */
  DatePickerCtrl.prototype.detachCalendarPane = function() {
    this.$element.removeClass('md-datepicker-open');
    this.calendarPane.classList.remove('md-pane-open');
    this.calendarPane.classList.remove('md-datepicker-pos-adjusted');

    if (this.isCalendarOpen) {
      this.$mdUtil.enableScrolling();
    }

    if (this.calendarPane.parentNode) {
      // Use native DOM removal because we do not want any of the angular state of this element
      // to be disposed.
      this.calendarPane.parentNode.removeChild(this.calendarPane);
    }
  };

  /**
   * Open the floating calendar pane.
   * @param {Event} event
   */
  DatePickerCtrl.prototype.openCalendarPane = function(event) {
    if (!this.isCalendarOpen && !this.isDisabled) {
      this.isCalendarOpen = true;
      this.calendarPaneOpenedFrom = event.target;

      // Because the calendar pane is attached directly to the body, it is possible that the
      // rest of the component (input, etc) is in a different scrolling container, such as
      // an md-content. This means that, if the container is scrolled, the pane would remain
      // stationary. To remedy this, we disable scrolling while the calendar pane is open, which
      // also matches the native behavior for things like `<select>` on Mac and Windows.
      this.$mdUtil.disableScrollAround(this.calendarPane);

      this.attachCalendarPane();
      this.focusCalendar();

      // Attach click listener inside of a timeout because, if this open call was triggered by a
      // click, we don't want it to be immediately propogated up to the body and handled.
      var self = this;
      this.$mdUtil.nextTick(function() {
        // Use 'touchstart` in addition to click in order to work on iOS Safari, where click
        // events aren't propogated under most circumstances.
        // See http://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
        self.documentElement.on('click touchstart', self.bodyClickHandler);
      }, false);

      window.addEventListener('resize', this.windowResizeHandler);
    }
  };

  /** Close the floating calendar pane. */
  DatePickerCtrl.prototype.closeCalendarPane = function() {
    if (this.isCalendarOpen) {
      this.detachCalendarPane();
      this.isCalendarOpen = false;
      this.calendarPaneOpenedFrom.focus();
      this.calendarPaneOpenedFrom = null;

      if (!this.isDateRange) {
        this.ngModelCtrl.$setTouched();
      } else {
        this.isBeginDateTouched = true;
        this.isEndDateTouched = true;
      }

      this.documentElement.off('click touchstart', this.bodyClickHandler);
      window.removeEventListener('resize', this.windowResizeHandler);
    }
  };

  //TODO(sueinh): Investigate where these functions should be used within the md-datepicker or md-calendar template.
  /** Returns the view state of the start date. */
  DatePickerCtrl.prototype.getBeginDateViewValue = function() {
    return this.startDateViewValue;
  };

  /** Returns the view state of the end date. */
  DatePickerCtrl.prototype.getEndDateViewValue = function() {
    return this.endDateViewValue;
  };

  /** Returns the date range is validity. */
  DatePickerCtrl.prototype.getDateRangeValidity = function() {
    return this.dateRangeValidity;
  };

  /**
   * Sets the view state of the start date.
   * @param {Date} date
   */
  DatePickerCtrl.prototype.setBeginDateViewValue = function(date) {
    this.startDateViewValue = date;
  };

  /**
   * Sets the view state of the end date.
   * @param {Date} date
   */
  DatePickerCtrl.prototype.setEndDateViewValue = function(date) {
    this.endDateViewValue = date;
  };

  /**
   * Sets the date range is validity
   * @param {string} validationErrorKey
   * @param {boolean} isValid
   */
  DatePickerCtrl.prototype.setDateRangeValidity = function(validationErrorKey, isValid) {
    this.dateRangeValidity[validationErrorKey] = isValid;
    this.dateRangeValidity.valid = true;

    for(var key in this.dateRangeValidity) {
      if (this.dateRangeValidity.hasOwnProperty(key) && !this.dateRangeValidity[key]) {
        this.dateRangeValidity.valid = false;
      }
    }
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
   * Sets whether the start date input is currently focused.
   * @param {boolean} isFocused
   */
  DatePickerCtrl.prototype.setStartDateFocused = function(isFocused) {
    if (!this.isDateRange) {
      if (!isFocused) {
        this.ngModelCtrl.$setTouched();
      }
    } else {
      if (!isFocused) {
        this.isBeginDateTouched = true;
        this.isEndDateTouched = false;
      }
    }
    this.isFocused = isFocused;
  };

  /**
   * Sets whether the end date input is currently focused.
   * @param {boolean} isFocused
   */
  DatePickerCtrl.prototype.setEndDateFocused = function(isFocused) {
    if (!this.isDateRange) {
      if (!isFocused) {
        this.ngModelCtrl.$setTouched();
      }
    } else {
      if (!isFocused) {
        this.isBeginDateTouched = false;
        this.isEndDateTouched = true;
      }
    }
    this.isFocused = isFocused;
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
