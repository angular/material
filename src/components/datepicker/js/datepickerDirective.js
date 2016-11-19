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

        var triangleButton = '';

        if (hiddenIcons !== 'all' && hiddenIcons !== 'triangle') {
          triangleButton = '' +
            '<md-button type="button" md-no-ink ' +
              'class="md-datepicker-triangle-button md-icon-button" ' +
              'ng-click="ctrl.openCalendarPane($event)" ' +
              'aria-label="{{::ctrl.locale.msgOpenCalendar}}">' +
            '<div class="md-datepicker-expand-triangle"></div>' +
          '</md-button>';

          tElement.addClass(HAS_TRIANGLE_ICON_CLASS);
        }

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
        '</div>' +

        // This pane will be detached from here and re-attached to the document body.
        '<div class="md-datepicker-calendar-pane md-whiteframe-z1" id="{{::ctrl.calendarPaneId}}">' +
          '<div class="md-datepicker-input-mask">' +
            '<div class="md-datepicker-input-mask-opaque"></div>' +
          '</div>' +
          '<div class="md-datepicker-calendar">' +
            '<md-calendar role="dialog" aria-label="{{::ctrl.locale.msgCalendar}}" ' +
                'md-current-view="{{::ctrl.currentView}}"' +
                'md-min-date="ctrl.minDate"' +
                'md-max-date="ctrl.maxDate"' +
                'md-date-filter="ctrl.dateFilter"' +
                'ng-model="ctrl.date" ng-if="ctrl.isCalendarOpen">' +
            '</md-calendar>' +
          '</div>' +
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
            .toggleClass(HAS_CALENDAR_ICON_CLASS, attr.mdHideIcons !== 'calendar' && attr.mdHideIcons !== 'all');

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
  var HAS_CALENDAR_ICON_CLASS = '_md-datepicker-has-calendar-icon';

  /** Class to be applied when the triangle icon is enabled. */
  var HAS_TRIANGLE_ICON_CLASS = '_md-datepicker-has-triangle-icon';

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

  /**
   * Controller for md-datepicker.
   *
   * @ngInject @constructor
   */
  function DatePickerCtrl($scope, $element, $attrs, $window, $mdConstant,
    $mdTheming, $mdUtil, $mdDateLocale, $$mdDateUtil, $$rAF, $filter) {

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

    /** @final */
    this.$mdDateLocale = $mdDateLocale;

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
    this.inputElement = $element[0].querySelector('input');

    /** @final {!angular.JQLite} */
    this.ngInputElement = angular.element(this.inputElement);

    /** @type {HTMLElement} */
    this.inputContainer = $element[0].querySelector('.md-datepicker-input-container');

    /** @type {HTMLElement} Floating calendar pane. */
    this.calendarPane = $element[0].querySelector('.md-datepicker-calendar-pane');

    /** @type {HTMLElement} Calendar icon button. */
    this.calendarButton = $element[0].querySelector('.md-datepicker-button');

    /**
     * Element covering everything but the input in the top of the floating calendar pane.
     * @type {!angular.JQLite}
     */
    this.inputMask = angular.element($element[0].querySelector('.md-datepicker-input-mask-opaque'));

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
    this.isDisabled;
    this.setDisabled($element[0].disabled || angular.isString($attrs.disabled));

    /** @type {boolean} Whether the date-picker's calendar pane is open. */
    this.isCalendarOpen = false;

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

    /** Pre-bound click handler is saved so that the event listener can be removed. */
    this.bodyClickHandler = angular.bind(this, this.handleBodyClick);

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
    $mdTheming(angular.element(this.calendarPane));

    var self = this;

    $scope.$on('$destroy', function() {
      self.detachCalendarPane();
    });

    if ($attrs.mdIsOpen) {
      $scope.$watch('ctrl.isOpen', function(shouldBeOpen) {
        if (shouldBeOpen) {
          self.openCalendarPane({
            target: self.inputElement
          });
        } else {
          self.closeCalendarPane();
        }
      });
    }

    // For Angular 1.4 and older, where there are no lifecycle hooks but bindings are pre-assigned,
    // manually call the $onInit hook.
    if (angular.version.major === 1 && angular.version.minor <= 4) {
      this.$onInit();
    }

  }

  /**
   * Angular Lifecycle hook for newer Angular versions.
   * Bindings are not guaranteed to have been assigned in the controller, but they are in the $onInit hook.
   */
  DatePickerCtrl.prototype.$onInit = function() {

    /**
     * Holds locale-specific formatters, parsers, labels etc. Allows
     * the user to override specific ones from the $mdDateLocale provider.
     * @type {!Object}
     */
    this.locale = this.dateLocale ? angular.extend({}, this.$mdDateLocale, this.dateLocale) : this.$mdDateLocale;

    this.installPropertyInterceptors();
    this.attachChangeListeners();
    this.attachInteractionListeners();
  };

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
    var keyCodes = this.$mdConstant.KEY_CODE;

    // Add event listener through angular so that we can triggerHandler in unit tests.
    self.ngInputElement.on('keydown', function(event) {
      if (event.altKey && event.keyCode == keyCodes.DOWN_ARROW) {
        self.openCalendarPane(event);
        $scope.$digest();
      }
    });

    if (self.openOnFocus) {
      self.ngInputElement.on('focus', angular.bind(self, self.openCalendarPane));
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
    var calendarPane = this.calendarPane;
    var body = document.body;

    calendarPane.style.transform = '';
    this.$element.addClass(OPEN_CLASS);
    this.mdInputContainer && this.mdInputContainer.element.addClass(OPEN_CLASS);
    angular.element(body).addClass('md-datepicker-is-showing');

    var elementRect = this.inputContainer.getBoundingClientRect();
    var bodyRect = body.getBoundingClientRect();

    if (!this.topMargin || this.topMargin < 0) {
      this.topMargin = (this.inputMask.parent().prop('clientHeight') - this.ngInputElement.prop('clientHeight')) / 2;
    }

    // Check to see if the calendar pane would go off the screen. If so, adjust position
    // accordingly to keep it within the viewport.
    var paneTop = elementRect.top - bodyRect.top - this.topMargin;
    var paneLeft = elementRect.left - bodyRect.left - this.leftMargin;

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

    // Creates an overlay with a hole the same size as element. We remove a pixel or two
    // on each end to make it overlap slightly. The overlay's background is added in
    // the theme in the form of a box-shadow with a huge spread.
    this.inputMask.css({
      position: 'absolute',
      left: this.leftMargin + 'px',
      top: this.topMargin + 'px',
      width: (elementRect.width - 1) + 'px',
      height: (elementRect.height - 2) + 'px'
    });

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

    // Add CSS class after one frame to trigger open animation.
    this.$$rAF(function() {
      calendarPane.classList.add('md-pane-open');
    });
  };

  /** Detach the floating calendar pane from the document. */
  DatePickerCtrl.prototype.detachCalendarPane = function() {
    this.$element.removeClass(OPEN_CLASS);
    this.mdInputContainer && this.mdInputContainer.element.removeClass(OPEN_CLASS);
    angular.element(document.body).removeClass('md-datepicker-is-showing');
    this.calendarPane.classList.remove('md-pane-open');
    this.calendarPane.classList.remove('md-datepicker-pos-adjusted');

    if (this.isCalendarOpen) {
      this.$mdUtil.enableScrolling();
    }

    if (this.calendarPane.parentNode) {
      // Use native DOM removal because we do not want any of the
      // angular state of this element to be disposed.
      this.calendarPane.parentNode.removeChild(this.calendarPane);
    }
  };

  /**
   * Open the floating calendar pane.
   * @param {Event} event
   */
  DatePickerCtrl.prototype.openCalendarPane = function(event) {
    if (!this.isCalendarOpen && !this.isDisabled && !this.inputFocusedOnWindowBlur) {
      this.isCalendarOpen = this.isOpen = true;
      this.calendarPaneOpenedFrom = event.target;

      // Because the calendar pane is attached directly to the body, it is possible that the
      // rest of the component (input, etc) is in a different scrolling container, such as
      // an md-content. This means that, if the container is scrolled, the pane would remain
      // stationary. To remedy this, we disable scrolling while the calendar pane is open, which
      // also matches the native behavior for things like `<select>` on Mac and Windows.
      this.$mdUtil.disableScrollAround(this.calendarPane);

      this.attachCalendarPane();
      this.focusCalendar();
      this.evalAttr('ngFocus');

      // Attach click listener inside of a timeout because, if this open call was triggered by a
      // click, we don't want it to be immediately propogated up to the body and handled.
      var self = this;
      this.$mdUtil.nextTick(function() {
        // Use 'touchstart` in addition to click in order to work on iOS Safari, where click
        // events aren't propogated under most circumstances.
        // See http://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
        self.documentElement.on('click touchstart', self.bodyClickHandler);
      }, false);

      window.addEventListener(this.windowEventName, this.windowEventHandler);
    }
  };

  /** Close the floating calendar pane. */
  DatePickerCtrl.prototype.closeCalendarPane = function() {
    if (this.isCalendarOpen) {
      var self = this;

      self.detachCalendarPane();
      self.ngModelCtrl.$setTouched();
      self.evalAttr('ngBlur');

      self.documentElement.off('click touchstart', self.bodyClickHandler);
      window.removeEventListener(self.windowEventName, self.windowEventHandler);

      self.calendarPaneOpenedFrom.focus();
      self.calendarPaneOpenedFrom = null;

      if (self.openOnFocus) {
        // Ensures that all focus events have fired before resetting
        // the calendar. Prevents the calendar from reopening immediately
        // in IE when md-open-on-focus is set. Also it needs to trigger
        // a digest, in order to prevent issues where the calendar wasn't
        // showing up on the next open.
        self.$mdUtil.nextTick(reset);
      } else {
        reset();
      }
    }

    function reset(){
      self.isCalendarOpen = self.isOpen = false;
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
   * Handles a click on the document body when the floating calendar pane is open.
   * Closes the floating calendar pane if the click is not inside of it.
   * @param {MouseEvent} event
   */
  DatePickerCtrl.prototype.handleBodyClick = function(event) {
    if (this.isCalendarOpen) {
      var isInCalendar = this.$mdUtil.getClosest(event.target, 'md-calendar');

      if (!isInCalendar) {
        this.closeCalendarPane();
      }

      this.$scope.$digest();
    }
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
})();
