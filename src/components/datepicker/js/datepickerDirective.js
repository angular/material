(function() {
  'use strict';

  // POST RELEASE
  // TODO(jelbourn): Demo that uses moment.js
  // TODO(jelbourn): make sure this plays well with validation and ngMessages.
  // TODO(jelbourn): calendar pane doesn't open up outside of visible viewport.
  // TODO(jelbourn): forward more attributes to the internal input (required, autofocus, etc.)
  // TODO(jelbourn): something better for mobile (calendar panel takes up entire screen?)
  // TODO(jelbourn): input behavior (masking? auto-complete?)


  angular.module('material.components.datepicker')
      .directive('mdDatepicker', datePickerDirective);

  /**
   * @ngdoc directive
   * @name mdDatepicker
   * @module material.components.datepicker
   *
   * @param {Date} ng-model The component's model. Expects a JavaScript Date object.
   * @param {Object=} ng-model-options Allows tuning of the way in which `ng-model` is being updated. Also allows
   * for a timezone to be specified. <a href="https://docs.angularjs.org/api/ng/directive/ngModelOptions#usage">Read more at the ngModelOptions docs.</a>
   * @param {expression=} ng-change Expression evaluated when the model value changes.
   * @param {expression=} ng-focus Expression evaluated when the input is focused or the calendar is opened.
   * @param {expression=} ng-blur Expression evaluated when focus is removed from the input or the calendar is closed.
   * @param {boolean=} ng-disabled Whether the datepicker is disabled.
   * @param {boolean=} ng-required Whether a value is required for the datepicker.
   * @param {Date=} md-min-date Expression representing a min date (inclusive).
   * @param {Date=} md-max-date Expression representing a max date (inclusive).
   * @param {(function(Date): boolean)=} md-date-filter Function expecting a date and returning a boolean whether it can be selected or not.
   * @param {String=} md-placeholder The date input placeholder value.
   * @param {String=} md-open-on-focus When present, the calendar will be opened when the input is focused.
   * @param {Boolean=} md-is-open Expression that can be used to open the datepicker's calendar on-demand.
   * @param {String=} md-current-view Default open view of the calendar pane. Can be either "month" or "year".
   * @param {String=} md-hide-icons Determines which datepicker icons should be hidden. Note that this may cause the
   * datepicker to not align properly with other components. **Use at your own risk.** Possible values are:
   * * `"all"` - Hides all icons.
   * * `"calendar"` - Only hides the calendar icon.
   * * `"triangle"` - Only hides the triangle icon.
   * @param {Object=} md-date-locale Allows for the values from the `$mdDateLocaleProvider` to be
   * ovewritten on a per-element basis (e.g. `msgOpenCalendar` can be overwritten with
   * `md-date-locale="{ msgOpenCalendar: 'Open a special calendar' }"`).
   *
   * @description
   * `<md-datepicker>` is a component used to select a single date.
   * For information on how to configure internationalization for the date picker,
   * see `$mdDateLocaleProvider`.
   *
   * This component supports [ngMessages](https://docs.angularjs.org/api/ngMessages/directive/ngMessages).
   * Supported attributes are:
   * * `required`: whether a required date is not set.
   * * `mindate`: whether the selected date is before the minimum allowed date.
   * * `maxdate`: whether the selected date is after the maximum allowed date.
   * * `debounceInterval`: ms to delay input processing (since last debounce reset); default value 500ms
   *
   * @usage
   * <hljs lang="html">
   *   <md-datepicker ng-model="birthday"></md-datepicker>
   * </hljs>
   *
   */

  function datePickerDirective($$mdSvgRegistry, $mdUtil, $mdAria, inputDirective) {
    return {
      template: function(tElement, tAttrs) {
        // Buttons are not in the tab order because users can open the calendar via keyboard
        // interaction on the text input, and multiple tab stops for one component (picker)
        // may be confusing.
        var hiddenIcons = tAttrs.mdHideIcons;
        var ariaLabelValue = tAttrs.ariaLabel || tAttrs.mdPlaceholder;

        var calendarButton = (hiddenIcons === 'all' || hiddenIcons === 'calendar') ? '' :
          '<md-button class="md-datepicker-button md-icon-button" type="button" ' +
              'tabindex="-1" aria-hidden="true" ' +
              'ng-click="ctrl.openCalendarPane($event)">' +
            '<md-icon class="md-datepicker-calendar-icon" aria-label="md-calendar" ' +
                     'md-svg-src="' + $$mdSvgRegistry.mdCalendar + '"></md-icon>' +
          '</md-button>';

        var triangleButton = (hiddenIcons === 'all' || hiddenIcons === 'triangle') ? '' :
          '<md-button type="button" md-no-ink ' +
              'class="md-datepicker-triangle-button md-icon-button" ' +
              'ng-click="ctrl.openCalendarPane($event)" ' +
              'aria-label="{{::ctrl.locale.msgOpenCalendar}}">' +
            '<div class="md-datepicker-expand-triangle"></div>' +
          '</md-button>';

        return calendarButton +
        '<div class="md-datepicker-input-container" ng-class="{\'md-datepicker-focused\': ctrl.isFocused}">' +
          '<input ' +
            (ariaLabelValue ? 'aria-label="' + ariaLabelValue + '" ' : '') +
            'class="md-datepicker-input" ' +
            'aria-haspopup="true" ' +
            'aria-expanded="{{ctrl.isCalendarOpen}}" ' +
            'ng-focus="ctrl.setFocused(true)" ' +
            'ng-blur="ctrl.setFocused(false)"> ' +
            triangleButton +
        '</div>';
      },
      require: ['ngModel', 'mdDatepicker', '?^mdInputContainer', '?^form'],
      scope: {
        minDate: '=mdMinDate',
        maxDate: '=mdMaxDate',
        placeholder: '@mdPlaceholder',
        currentView: '@mdCurrentView',
        dateFilter: '=mdDateFilter',
        isOpen: '=?mdIsOpen',
        debounceInterval: '=mdDebounceInterval',
        dateLocale: '=mdDateLocale'
      },
      controller: DatePickerCtrl,
      controllerAs: 'ctrl',
      bindToController: true,
      link: function(scope, element, attr, controllers) {
        var ngModelCtrl = controllers[0];
        var mdDatePickerCtrl = controllers[1];
        var mdInputContainer = controllers[2];
        var parentForm = controllers[3];
        var mdNoAsterisk = $mdUtil.parseAttributeBoolean(attr.mdNoAsterisk);

        mdDatePickerCtrl.configureNgModel(ngModelCtrl, mdInputContainer, inputDirective);

        if (mdInputContainer) {
          // We need to move the spacer after the datepicker itself,
          // because md-input-container adds it after the
          // md-datepicker-input by default. The spacer gets wrapped in a
          // div, because it floats and gets aligned next to the datepicker.
          // There are easier ways of working around this with CSS (making the
          // datepicker 100% wide, change the `display` etc.), however they
          // break the alignment with any other form controls.
          var spacer = element[0].querySelector('.md-errors-spacer');

          if (spacer) {
            element.after(angular.element('<div>').append(spacer));
          }

          mdInputContainer.setHasPlaceholder(attr.mdPlaceholder);
          mdInputContainer.input = element;
          mdInputContainer.element
            .addClass(INPUT_CONTAINER_CLASS)
            .toggleClass(HAS_ICON_CLASS, attr.mdHideIcons !== 'calendar' && attr.mdHideIcons !== 'all');

          if (!mdInputContainer.label) {
            $mdAria.expect(element, 'aria-label', attr.mdPlaceholder);
          } else if(!mdNoAsterisk) {
            attr.$observe('required', function(value) {
              mdInputContainer.label.toggleClass('md-required', !!value);
            });
          }

          scope.$watch(mdInputContainer.isErrorGetter || function() {
            return ngModelCtrl.$invalid && (ngModelCtrl.$touched || (parentForm && parentForm.$submitted));
          }, mdInputContainer.setInvalid);
        } else if (parentForm) {
          // If invalid, highlights the input when the parent form is submitted.
          var parentSubmittedWatcher = scope.$watch(function() {
            return parentForm.$submitted;
          }, function(isSubmitted) {
            if (isSubmitted) {
              mdDatePickerCtrl.updateErrorState();
              parentSubmittedWatcher();
            }
          });
        }
      }
    };
  }

  /** Additional offset for the input's `size` attribute, which is updated based on its content. */
  var EXTRA_INPUT_SIZE = 3;

  /** Class applied to the container if the date is invalid. */
  var INVALID_CLASS = 'md-datepicker-invalid';

  /** Class applied to the datepicker when it's open. */
  var OPEN_CLASS = 'md-datepicker-open';

  /** Class applied to the md-input-container, if a datepicker is placed inside it */
  var INPUT_CONTAINER_CLASS = '_md-datepicker-floating-label';

  /** Class to be applied when the calendar icon is enabled. */
  var HAS_ICON_CLASS = '_md-datepicker-has-calendar-icon';

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

  /** Used for checking whether the current user agent is on iOS or Android. */
  var IS_MOBILE_REGEX = /ipad|iphone|ipod|android/i;

  var CALENDAR = '' +
  '<div class="md-datepicker-calendar-pane md-whiteframe-z1" id="{{::ctrl.calendarPaneId}}">' +
    '<div class="md-datepicker-input-mask" tabindex="-1" ng-click="ctrl.closeCalendarPane()">' +
      '<div class="md-datepicker-input-mask-opaque"></div>' +
    '</div>' +
    '<div class="md-datepicker-calendar">' +
      '<md-calendar role="dialog" aria-label="{{::ctrl.locale.msgCalendar}}" ' +
          'md-current-view="{{::ctrl.currentView}}"' +
          'md-min-date="ctrl.minDate"' +
          'md-max-date="ctrl.maxDate"' +
          'md-date-filter="ctrl.dateFilter"' +
          'md-panel-ref="ctrl.panelRef"' +
          'ng-model="ctrl.date">' +
      '</md-calendar>' +
    '</div>' +
  '</div>';

  /**
   * Controller for md-datepicker.
   *
   * @ngInject @constructor
   */
  function DatePickerCtrl($scope, $element, $attrs, $window, $mdConstant,
    $mdTheming, $mdUtil, $mdDateLocale, $$mdDateUtil, $$rAF, $filter,
    $mdPanel) {

    /** @final */
    this.$window = $window;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.$mdConstant = $mdConstant;

    /* @final */
    this.$mdUtil = $mdUtil;

    /** @final */
    this.$$rAF = $$rAF;

    /**
     * Holds locale-specific formatters, parsers, labels etc. Allows
     * the user to override specific ones from the $mdDateLocale provider.
     * @type {!Object}
     */
    this.locale = this.dateLocale ? angular.extend({}, $mdDateLocale, this.dateLocale) : $mdDateLocale;

    /**
     * The root document element. This is used for attaching a top-level click handler to
     * close the calendar panel when a click outside said panel occurs. We use `documentElement`
     * instead of body because, when scrolling is disabled, some browsers consider the body element
     * to be completely off the screen and propagate events directly to the html element.
     * @type {!angular.JQLite}
     */
    this.documentElement = angular.element(document.documentElement);

    /** @final */
    this.$mdTheming = $mdTheming;

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {HTMLInputElement} */
    this.inputElement = $element[0].querySelector('input');

    /** @final {!angular.JQLite} */
    this.ngInputElement = angular.element(this.inputElement);

    /** @type {HTMLElement} */
    this.inputContainer = $element[0].querySelector('.md-datepicker-input-container');

    /** @type {HTMLElement} Calendar icon button. */
    this.calendarButton = $element[0].querySelector('.md-datepicker-button');

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Attributes} */
    this.$attrs = $attrs;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @type {Date} */
    this.date = null;

    /** @type {boolean} */
    this.isFocused = false;

    /** @type {boolean} */
    this.isDisabled = false;
    this.setDisabled($element[0].disabled || $attrs.hasOwnProperty('disabled'));

    /** @type {boolean} Whether the date-picker's calendar pane is open. Used internally. */
    this.isCalendarOpen = false;

    /**
     * Whether calendar should be open. Used when triggering the calendar externally.
     * It needs to be separate from `isCalendarOpen` in order to avoid some mixups
     * where it might trigger the calendar a couple of times in a row.
     * @type {boolean}
     */
    this.isOpen = false;

    /** @type {boolean} Used to prevent infinite loops when using mdOpenOnFocus. */
    this.preventInputFocus = false;

    /** @type {boolean} Whether the calendar should open when the input is focused. */
    this.openOnFocus = $attrs.hasOwnProperty('mdOpenOnFocus');

    /** @final */
    this.mdInputContainer = null;

    /**
     * Element from which the calendar pane was opened. Keep track of this so that we can return
     * focus to it when the pane is closed.
     * @type {HTMLElement}
     */
    this.calendarPaneOpenedFrom = null;

    /** @type {String} Unique id for the calendar pane. */
    this.calendarPaneId = 'md-date-pane-' + $mdUtil.nextUid();

    /**
     * Name of the event that will trigger a close. Necessary to sniff the browser, because
     * the resize event doesn't make sense on mobile and can have a negative impact since it
     * triggers whenever the browser zooms in on a focused input.
     */
    this.windowEventName = IS_MOBILE_REGEX.test(
      navigator.userAgent || navigator.vendor || window.opera
    ) ? 'orientationchange' : 'resize';

    /** Pre-bound close handler so that the event listener can be removed. */
    this.windowEventHandler = $mdUtil.debounce(angular.bind(this, this.closeCalendarPane), 100);

    /** Pre-bound handler for the window blur event. Allows for it to be removed later. */
    this.windowBlurHandler = angular.bind(this, this.handleWindowBlur);

    /** The built-in Angular date filter. */
    this.ngDateFilter = $filter('date');

    /** @type {Number} Extra margin for the left side of the floating calendar pane. */
    this.leftMargin = 20;

    /** @type {Number} Extra margin for the top of the floating calendar. Gets determined on the first open. */
    this.topMargin = null;

    /** @type {!MdPanelPosition} Position object for the mdPanel instance. */
    this.panelPosition = $mdPanel.newPanelPosition()
      .relativeTo(this.inputContainer)
      .addPanelPosition($mdPanel.xPosition.ALIGN_START, $mdPanel.yPosition.ALIGN_TOPS)
      .withOffsetX(-this.leftMargin + 'px')
      .withOffsetY(angular.bind(this, this.getPanelYOffset));

    /** @type {!MdPanelRef} Reference to the mdPanel instance of the calendar. */
    this.panelRef = $mdPanel.create({
      attachTo: document.body,
      template: CALENDAR,
      clickOutsideToClose: true,
      escapeToClose: true,
      focusOnOpen: false,
      scope: this.$scope.$new(),
      position: this.panelPosition,
      onDomRemoved: angular.bind(this, this.closeCalendarPane)
    });

    // Unless the user specifies so, the datepicker should not be a tab stop.
    // This is necessary because ngAria might add a tabindex to anything with an ng-model
    // (based on whether or not the user has turned that particular feature on/off).
    if ($attrs.tabindex) {
      this.ngInputElement.attr('tabindex', $attrs.tabindex);
      $attrs.$set('tabindex', null);
    } else {
      $attrs.$set('tabindex', '-1');
    }

    $attrs.$set('aria-owns', this.calendarPaneId);

    $mdTheming($element);

    this.installPropertyInterceptors();
    this.attachChangeListeners();
    this.attachInteractionListeners();

    if ($attrs.mdIsOpen) {
      $scope.$watch('ctrl.isOpen', function(shouldBeOpen) {
        if (shouldBeOpen) {
          self.openCalendarPane({ target: self.inputElement });
        } else {
          self.closeCalendarPane();
        }
      });
    }

    var self = this;

    $scope.$on('$destroy', function() {
      self.detachCalendarPane();
      self.panelRef.destroy();
    });
  }

  /**
   * Sets up the controller's reference to ngModelController and
   * applies Angular's `input[type="date"]` directive.
   * @param {!angular.NgModelController} ngModelCtrl Instance of the ngModel controller.
   * @param {Object} mdInputContainer Instance of the mdInputContainer controller.
   * @param {Object} inputDirective Config for Angular's `input` directive.
   */
  DatePickerCtrl.prototype.configureNgModel = function(ngModelCtrl, mdInputContainer, inputDirective) {
    this.ngModelCtrl = ngModelCtrl;
    this.mdInputContainer = mdInputContainer;

    // The input needs to be [type="date"] in order to be picked up by Angular.
    this.$attrs.$set('type', 'date');

    // Invoke the `input` directive link function, adding a stub for the element.
    // This allows us to re-use Angular's logic for setting the timezone via ng-model-options.
    // It works by calling the link function directly which then adds the proper `$parsers` and
    // `$formatters` to the ngModel controller.
    inputDirective[0].link.pre(this.$scope, {
      on: angular.noop,
      val: angular.noop,
      0: {}
    }, this.$attrs, [ngModelCtrl]);

    var self = this;

    // Responds to external changes to the model value.
    self.ngModelCtrl.$formatters.push(function(value) {
      if (value && !(value instanceof Date)) {
        throw Error('The ng-model for md-datepicker must be a Date instance. ' +
            'Currently the model is a: ' + (typeof value));
      }

      self.onExternalChange(value);

      return value;
    });

    // Responds to external error state changes (e.g. ng-required based on another input).
    ngModelCtrl.$viewChangeListeners.unshift(angular.bind(this, this.updateErrorState));

    // Forwards any events from the input to the root element. This is necessary to get `updateOn`
    // working for events that don't bubble (e.g. 'blur') since Angular binds the handlers to
    // the `<md-datepicker>`.
    var updateOn = self.$mdUtil.getModelOption(ngModelCtrl, 'updateOn');

    if (updateOn) {
      this.ngInputElement.on(
        updateOn,
        angular.bind(this.$element, this.$element.triggerHandler, updateOn)
      );
    }
  };

  /**
   * Attach event listeners for both the text input and the md-calendar.
   * Events are used instead of ng-model so that updates don't infinitely update the other
   * on a change. This should also be more performant than using a $watch.
   */
  DatePickerCtrl.prototype.attachChangeListeners = function() {
    var self = this;

    self.$scope.$on('md-calendar-change', function(event, date) {
      self.setModelValue(date);
      self.onExternalChange(date);
      self.closeCalendarPane();
    });

    self.ngInputElement.on('input', angular.bind(self, self.resizeInputElement));

    var debounceInterval = angular.isDefined(this.debounceInterval) ?
        this.debounceInterval : DEFAULT_DEBOUNCE_INTERVAL;
    self.ngInputElement.on('input', self.$mdUtil.debounce(self.handleInputEvent,
        debounceInterval, self));
  };

  /** Attach event listeners for user interaction. */
  DatePickerCtrl.prototype.attachInteractionListeners = function() {
    var self = this;
    var $scope = this.$scope;

    // Add event listener through angular so that we can triggerHandler in unit tests.
    self.ngInputElement.on('keydown', function(event) {
      if (event.altKey && event.keyCode === self.$mdConstant.KEY_CODE.DOWN_ARROW) {
        self.openCalendarPane(event);
        $scope.$digest();
      }
    });

    if (self.openOnFocus) {
      self.ngInputElement.on('focus', function(event) {
        if (!self.preventInputFocus && !self.inputFocusedOnWindowBlur) {
          self.preventInputFocus = true;
          self.openCalendarPane(event);
        } else if (self.inputFocusedOnWindowBlur) {
          self.inputFocusedOnWindowBlur = false;
        }
      });

      angular.element(self.$window).on('blur', self.windowBlurHandler);

      $scope.$on('$destroy', function() {
        angular.element(self.$window).off('blur', self.windowBlurHandler);
      });
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

    if (this.$attrs.ngDisabled) {
      // The expression is to be evaluated against the directive element's scope and not
      // the directive's isolate scope.
      var scope = this.$scope.$parent;

      if (scope) {
        scope.$watch(this.$attrs.ngDisabled, function(isDisabled) {
          self.setDisabled(isDisabled);
        });
      }
    }

    Object.defineProperty(this, 'placeholder', {
      get: function() { return self.inputElement.placeholder; },
      set: function(value) { self.inputElement.placeholder = value || ''; }
    });
  };

  /**
   * Sets whether the date-picker is disabled.
   * @param {boolean} isDisabled
   */
  DatePickerCtrl.prototype.setDisabled = function(isDisabled) {
    this.isDisabled = isDisabled;
    this.inputElement.disabled = isDisabled;

    if (this.calendarButton) {
      this.calendarButton.disabled = isDisabled;
    }
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
   */
  DatePickerCtrl.prototype.updateErrorState = function(opt_date) {
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

    angular.element(this.inputContainer).toggleClass(INVALID_CLASS, !this.ngModelCtrl.$valid);
  };

  /** Clears any error flags set by `updateErrorState`. */
  DatePickerCtrl.prototype.clearErrorState = function() {
    this.inputContainer.classList.remove(INVALID_CLASS);
    ['mindate', 'maxdate', 'filtered', 'valid'].forEach(function(field) {
      this.ngModelCtrl.$setValidity(field, true);
    }, this);
  };

  /** Resizes the input element based on the size of its content. */
  DatePickerCtrl.prototype.resizeInputElement = function() {
    this.inputElement.size = this.inputElement.value.length + EXTRA_INPUT_SIZE;
  };

  /**
   * Sets the model value if the user input is a valid date.
   * Adds an invalid class to the input element if not.
   */
  DatePickerCtrl.prototype.handleInputEvent = function() {
    var inputString = this.inputElement.value;
    var parsedDate = inputString ? this.locale.parseDate(inputString) : null;
    this.dateUtil.setDateTimeToMidnight(parsedDate);

    // An input string is valid if it is either empty (representing no date)
    // or if it parses to a valid date that the user is allowed to select.
    var isValidInput = inputString == '' || (
      this.dateUtil.isValidDate(parsedDate) &&
      this.locale.isDateComplete(inputString) &&
      this.isDateEnabled(parsedDate)
    );

    // The datepicker's model is only updated when there is a valid input.
    if (isValidInput) {
      this.setModelValue(parsedDate);
      this.date = parsedDate;
    }

    this.updateErrorState(parsedDate);
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
    var self = this;

    return this.panelRef.open().then(function(panelRef) {
      var calendarPane = panelRef.panelEl[0].querySelector('.md-datepicker-calendar-pane');
      var inputMask = calendarPane.querySelector('.md-datepicker-input-mask-opaque');
      var elementRect = self.inputContainer.getBoundingClientRect();

      self.$mdTheming(angular.element(calendarPane));

      // Creates an overlay with a hole the same size as element. We remove a pixel or two
      // on each end to make it overlap slightly. The overlay's background is added in
      // the theme in the form of a box-shadow with a huge spread.
      angular.element(inputMask).css({
        position: 'absolute',
        left: self.leftMargin + 'px',

        // TODO(crisbeto): this should use getPanelYOffset once we ditch the units
        top: self.topMargin + 'px',
        width: elementRect.width + 'px',
        height: (elementRect.height - 2) + 'px'
      });

      // Add the CSS classes after one frame to trigger open animation. Note that it needs
      // an extra timeout, because in some casses rAF might fire too early (e.g. when the
      // input focus opens the calendar), breaking the animation.
      self.$mdUtil.nextTick(function() {
        self.$$rAF(function() {
          calendarPane.classList.add('md-pane-open');
          self.$element.addClass(OPEN_CLASS);
          self.mdInputContainer && self.mdInputContainer.element.addClass(OPEN_CLASS);
        });
      }, false);
    });
  };

  /** Detach the floating calendar pane from the document. */
  DatePickerCtrl.prototype.detachCalendarPane = function() {
    var panelRef = this.panelRef;

    this.$element.removeClass(OPEN_CLASS);
    this.mdInputContainer && this.mdInputContainer.element.removeClass(OPEN_CLASS);

    if (panelRef.panelEl) {
      panelRef.panelEl[0]
        .querySelector('.md-datepicker-calendar-pane')
        .classList.remove('md-pane-open');
    }

    panelRef.close();
  };

  /**
   * Open the floating calendar pane.
   * @param {Event} event
   */
  DatePickerCtrl.prototype.openCalendarPane = function(event) {
    if (!this.isCalendarOpen && !this.isDisabled) {
      var self = this;

      this.isCalendarOpen = this.isOpen = true;
      this.calendarPaneOpenedFrom = event.target;

      this.attachCalendarPane().then(function() {
        self.focusCalendar();
        self.evalAttr('ngFocus');
        window.addEventListener(self.windowEventName, self.windowEventHandler);
      });
    }
  };

  /** Close the floating calendar pane. */
  DatePickerCtrl.prototype.closeCalendarPane = function() {
    if (this.isCalendarOpen) {
      this.detachCalendarPane();
      this.ngModelCtrl.$setTouched();
      this.evalAttr('ngBlur');
      window.removeEventListener(this.windowEventName, this.windowEventHandler);

      this.calendarPaneOpenedFrom.focus();
      this.calendarPaneOpenedFrom = null;
      this.isCalendarOpen = this.isOpen = false;

      if (this.openOnFocus) {
        var self = this;

        this.$mdUtil.nextTick(function() {
          self.preventInputFocus = false;
        }, false);
      }
    }
  };

  /** Focus the calendar in the floating pane. */
  DatePickerCtrl.prototype.focusCalendar = function() {
    // Use a timeout in order to allow the calendar to be rendered, as it is gated behind an ng-if.
    var self = this;
    this.$mdUtil.nextTick(function() {
      var calendarEl = angular.element(self.panelRef.panelEl[0].querySelector('md-calendar'));
      calendarEl.controller('mdCalendar').focus();
    }, false);
  };

  /**
   * Sets whether the input is currently focused.
   * @param {boolean} isFocused
   */
  DatePickerCtrl.prototype.setFocused = function(isFocused) {
    if (!isFocused) {
      this.ngModelCtrl.$setTouched();
    }

    // The ng* expressions shouldn't be evaluated when mdOpenOnFocus is on,
    // because they also get called when the calendar is opened/closed.
    if (!this.openOnFocus) {
      this.evalAttr(isFocused ? 'ngFocus' : 'ngBlur');
    }

    this.isFocused = isFocused;
  };

  /**
   * Handles the event when the user navigates away from the current tab. Keeps track of
   * whether the input was focused when the event happened, in order to prevent the calendar
   * from re-opening.
   */
  DatePickerCtrl.prototype.handleWindowBlur = function() {
    this.inputFocusedOnWindowBlur = document.activeElement === this.inputElement;
  };

  /**
   * Evaluates an attribute expression against the parent scope.
   * @param {String} attr Name of the attribute to be evaluated.
   */
  DatePickerCtrl.prototype.evalAttr = function(attr) {
    if (this.$attrs[attr]) {
      this.$scope.$parent.$eval(this.$attrs[attr]);
    }
  };

  /**
   * Sets the ng-model value by first converting the date object into a strng. Converting it
   * is necessary, in order to pass Angular's `input[type="date"]` validations. Angular turns
   * the value into a Date object afterwards, before setting it on the model.
   * @param {Date=} value Date to be set as the model value.
   */
  DatePickerCtrl.prototype.setModelValue = function(value) {
    var timezone = this.$mdUtil.getModelOption(this.ngModelCtrl, 'timezone');
    this.ngModelCtrl.$setViewValue(this.ngDateFilter(value, 'yyyy-MM-dd', timezone));
  };

  /**
   * Updates the datepicker when a model change occurred externally.
   * @param {Date=} value Value that was set to the model.
   */
  DatePickerCtrl.prototype.onExternalChange = function(value) {
    var timezone = this.$mdUtil.getModelOption(this.ngModelCtrl, 'timezone');

    this.date = value;
    this.inputElement.value = this.locale.formatDate(value, timezone);
    this.mdInputContainer && this.mdInputContainer.setHasValue(!!value);
    this.resizeInputElement();
    this.updateErrorState();
  };

  /**
   * Calculates and caches the offset that will be used to position the
   * calendar overlay over the input element.
   * @return {string}
   */
  DatePickerCtrl.prototype.getPanelYOffset = function() {
    if (!this.topMargin || this.topMargin < 0) {
      var inputMask = this.panelRef.panelEl[0].querySelector('.md-datepicker-input-mask');
      this.topMargin = (inputMask.offsetHeight - this.inputElement.offsetHeight) / 2;
    }

    // TODO(crisbeto): the units can be removed once #9609 is merged.
    return -this.topMargin + 'px';
  };
})();
