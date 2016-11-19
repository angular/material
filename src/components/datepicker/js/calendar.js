(function() {
  'use strict';

  /**
   * @ngdoc directive
   * @name mdCalendar
   * @module material.components.datepicker
   *
   * @param {Date} ng-model The component's model. Should be a Date object.
   * @param {Date=} md-min-date Expression representing the minimum date.
   * @param {Date=} md-max-date Expression representing the maximum date.
   * @param {(function(Date): boolean)=} md-date-filter Function expecting a date and returning a boolean whether it can be selected or not.
   *
   * @description
   * `<md-calendar>` is a component that renders a calendar that can be used to select a date.
   * It is a part of the `<md-datepicker` pane, however it can also be used on it's own.
   *
   * @usage
   *
   * <hljs lang="html">
   *   <md-calendar ng-model="birthday"></md-calendar>
   * </hljs>
   */
  angular.module('material.components.datepicker')
    .directive('mdCalendar', calendarDirective);

  // POST RELEASE
  // TODO(jelbourn): Mac Cmd + left / right == Home / End
  // TODO(jelbourn): Refactor month element creation to use cloneNode (performance).
  // TODO(jelbourn): Define virtual scrolling constants (compactness) users can override.
  // TODO(jelbourn): Animated month transition on ng-model change (virtual-repeat)
  // TODO(jelbourn): Scroll snapping (virtual repeat)
  // TODO(jelbourn): Remove superfluous row from short months (virtual-repeat)
  // TODO(jelbourn): Month headers stick to top when scrolling.
  // TODO(jelbourn): Previous month opacity is lowered when partially scrolled out of view.
  // TODO(jelbourn): Support md-calendar standalone on a page (as a tabstop w/ aria-live
  //     announcement and key handling).
  // Read-only calendar (not just date-picker).

  function calendarDirective() {
    return {
      template: function(tElement, tAttr) {
        // TODO(crisbeto): This is a workaround that allows the calendar to work, without
        // a datepicker, until issue #8585 gets resolved. It can safely be removed
        // afterwards. This ensures that the virtual repeater scrolls to the proper place on load by
        // deferring the execution until the next digest. It's necessary only if the calendar is used
        // without a datepicker, otherwise it's already wrapped in an ngIf.
        var extraAttrs = tAttr.hasOwnProperty('ngIf') ? '' : 'ng-if="calendarCtrl.isInitialized"';
        var template = '' +
          '<div ng-switch="calendarCtrl.currentView" ' + extraAttrs + '>' +
            '<md-calendar-year ng-switch-when="year"></md-calendar-year>' +
            '<md-calendar-month ng-switch-default></md-calendar-month>' +
          '</div>';

        return template;
      },
      scope: {
        minDate: '=mdMinDate',
        maxDate: '=mdMaxDate',
        dateFilter: '=mdDateFilter',
        _currentView: '@mdCurrentView'
      },
      require: ['ngModel', 'mdCalendar'],
      controller: CalendarCtrl,
      controllerAs: 'calendarCtrl',
      bindToController: true,
      link: function(scope, element, attrs, controllers) {
        var ngModelCtrl = controllers[0];
        var mdCalendarCtrl = controllers[1];
        mdCalendarCtrl.configureNgModel(ngModelCtrl);
      }
    };
  }

  /**
   * Occasionally the hideVerticalScrollbar method might read an element's
   * width as 0, because it hasn't been laid out yet. This value will be used
   * as a fallback, in order to prevent scenarios where the element's width
   * would otherwise have been set to 0. This value is the "usual" width of a
   * calendar within a floating calendar pane.
   */
  var FALLBACK_WIDTH = 340;

  /** Next identifier for calendar instance. */
  var nextUniqueId = 0;

  /**
   * Controller for the mdCalendar component.
   * @ngInject @constructor
   */
  function CalendarCtrl($element, $scope, $$mdDateUtil, $mdUtil,
    $mdConstant, $mdTheming, $$rAF, $attrs, $mdDateLocale) {

    $mdTheming($element);

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.$mdUtil = $mdUtil;

    /** @final */
    this.keyCode = $mdConstant.KEY_CODE;

    /** @final */
    this.$$rAF = $$rAF;

    /** @final */
    this.$mdDateLocale = $mdDateLocale;

    /** @final {Date} */
    this.today = this.dateUtil.createDateAtMidnight();

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {String} Class applied to the selected date cell. */
    this.SELECTED_DATE_CLASS = 'md-calendar-selected-date';

    /** @type {String} Class applied to the cell for today. */
    this.TODAY_CLASS = 'md-calendar-date-today';

    /** @type {String} Class applied to the focused cell. */
    this.FOCUSED_DATE_CLASS = 'md-focus';

    /** @final {number} Unique ID for this calendar instance. */
    this.id = nextUniqueId++;

    /**
     * The date that is currently focused or showing in the calendar. This will initially be set
     * to the ng-model value if set, otherwise to today. It will be updated as the user navigates
     * to other months. The cell corresponding to the displayDate does not necesarily always have
     * focus in the document (such as for cases when the user is scrolling the calendar).
     * @type {Date}
     */
    this.displayDate = null;

    /**
     * The selected date. Keep track of this separately from the ng-model value so that we
     * can know, when the ng-model value changes, what the previous value was before it's updated
     * in the component's UI.
     *
     * @type {Date}
     */
    this.selectedDate = null;

    /**
     * The first date that can be rendered by the calendar. The default is taken
     * from the mdDateLocale provider and is limited by the mdMinDate.
     * @type {Date}
     */
    this.firstRenderableDate = null;

    /**
     * The last date that can be rendered by the calendar. The default comes
     * from the mdDateLocale provider and is limited by the maxDate.
     * @type {Date}
     */
    this.lastRenderableDate = null;

    /**
     * Used to toggle initialize the root element in the next digest.
     * @type {Boolean}
     */
    this.isInitialized = false;

    /**
     * Cache for the  width of the element without a scrollbar. Used to hide the scrollbar later on
     * and to avoid extra reflows when switching between views.
     * @type {Number}
     */
    this.width = 0;

    /**
     * Caches the width of the scrollbar in order to be used when hiding it and to avoid extra reflows.
     * @type {Number}
     */
    this.scrollbarWidth = 0;

    // Unless the user specifies so, the calendar should not be a tab stop.
    // This is necessary because ngAria might add a tabindex to anything with an ng-model
    // (based on whether or not the user has turned that particular feature on/off).
    if (!$attrs.tabindex) {
      $element.attr('tabindex', '-1');
    }

    var boundKeyHandler = angular.bind(this, this.handleKeyEvent);



    // If use the md-calendar directly in the body without datepicker,
    // handleKeyEvent will disable other inputs on the page.
    // So only apply the handleKeyEvent on the body when the md-calendar inside datepicker,
    // otherwise apply on the calendar element only.

    var handleKeyElement;
    if ($element.parent().hasClass('md-datepicker-calendar')) {
      handleKeyElement = angular.element(document.body);
    } else {
      handleKeyElement = $element;
    }

    // Bind the keydown handler to the body, in order to handle cases where the focused
    // element gets removed from the DOM and stops propagating click events.
    handleKeyElement.on('keydown', boundKeyHandler);

    $scope.$on('$destroy', function() {
      handleKeyElement.off('keydown', boundKeyHandler);
    });

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
  CalendarCtrl.prototype.$onInit = function() {

    /**
     * The currently visible calendar view. Note the prefix on the scope value,
     * which is necessary, because the datepicker seems to reset the real one value if the
     * calendar is open, but the value on the datepicker's scope is empty.
     * @type {String}
     */
    this.currentView = this._currentView || 'month';

    var dateLocale = this.$mdDateLocale;

    if (this.minDate && this.minDate > dateLocale.firstRenderableDate) {
      this.firstRenderableDate = this.minDate;
    } else {
      this.firstRenderableDate = dateLocale.firstRenderableDate;
    }

    if (this.maxDate && this.maxDate < dateLocale.lastRenderableDate) {
      this.lastRenderableDate = this.maxDate;
    } else {
      this.lastRenderableDate = dateLocale.lastRenderableDate;
    }
  };

  /**
   * Sets up the controller's reference to ngModelController.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  CalendarCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    var self = this;

    self.ngModelCtrl = ngModelCtrl;

    self.$mdUtil.nextTick(function() {
      self.isInitialized = true;
    });

    ngModelCtrl.$render = function() {
      var value = this.$viewValue;

      // Notify the child scopes of any changes.
      self.$scope.$broadcast('md-calendar-parent-changed', value);

      // Set up the selectedDate if it hasn't been already.
      if (!self.selectedDate) {
        self.selectedDate = value;
      }

      // Also set up the displayDate.
      if (!self.displayDate) {
        self.displayDate = self.selectedDate || self.today;
      }
    };
  };

  /**
   * Sets the ng-model value for the calendar and emits a change event.
   * @param {Date} date
   */
  CalendarCtrl.prototype.setNgModelValue = function(date) {
    var value = this.dateUtil.createDateAtMidnight(date);
    this.focus(value);
    this.$scope.$emit('md-calendar-change', value);
    this.ngModelCtrl.$setViewValue(value);
    this.ngModelCtrl.$render();
    return value;
  };

  /**
   * Sets the current view that should be visible in the calendar
   * @param {string} newView View name to be set.
   * @param {number|Date} time Date object or a timestamp for the new display date.
   */
  CalendarCtrl.prototype.setCurrentView = function(newView, time) {
    var self = this;

    self.$mdUtil.nextTick(function() {
      self.currentView = newView;

      if (time) {
        self.displayDate = angular.isDate(time) ? time : new Date(time);
      }
    });
  };

  /**
   * Focus the cell corresponding to the given date.
   * @param {Date} date The date to be focused.
   */
  CalendarCtrl.prototype.focus = function(date) {
    if (this.dateUtil.isValidDate(date)) {
      var previousFocus = this.$element[0].querySelector('.md-focus');
      if (previousFocus) {
        previousFocus.classList.remove(this.FOCUSED_DATE_CLASS);
      }

      var cellId = this.getDateId(date, this.currentView);
      var cell = document.getElementById(cellId);
      if (cell) {
        cell.classList.add(this.FOCUSED_DATE_CLASS);
        cell.focus();
        this.displayDate = date;
      }
    } else {
      var rootElement = this.$element[0].querySelector('[ng-switch]');

      if (rootElement) {
        rootElement.focus();
      }
    }
  };

  /**
   * Normalizes the key event into an action name. The action will be broadcast
   * to the child controllers.
   * @param {KeyboardEvent} event
   * @returns {String} The action that should be taken, or null if the key
   * does not match a calendar shortcut.
   */
  CalendarCtrl.prototype.getActionFromKeyEvent = function(event) {
    var keyCode = this.keyCode;

    switch (event.which) {
      case keyCode.ENTER: return 'select';

      case keyCode.RIGHT_ARROW: return 'move-right';
      case keyCode.LEFT_ARROW: return 'move-left';

      // TODO(crisbeto): Might want to reconsider using metaKey, because it maps
      // to the "Windows" key on PC, which opens the start menu or resizes the browser.
      case keyCode.DOWN_ARROW: return event.metaKey ? 'move-page-down' : 'move-row-down';
      case keyCode.UP_ARROW: return event.metaKey ? 'move-page-up' : 'move-row-up';

      case keyCode.PAGE_DOWN: return 'move-page-down';
      case keyCode.PAGE_UP: return 'move-page-up';

      case keyCode.HOME: return 'start';
      case keyCode.END: return 'end';

      default: return null;
    }
  };

  /**
   * Handles a key event in the calendar with the appropriate action. The action will either
   * be to select the focused date or to navigate to focus a new date.
   * @param {KeyboardEvent} event
   */
  CalendarCtrl.prototype.handleKeyEvent = function(event) {
    var self = this;

    this.$scope.$apply(function() {
      // Capture escape and emit back up so that a wrapping component
      // (such as a date-picker) can decide to close.
      if (event.which == self.keyCode.ESCAPE || event.which == self.keyCode.TAB) {
        self.$scope.$emit('md-calendar-close');

        if (event.which == self.keyCode.TAB) {
          event.preventDefault();
        }

        return;
      }

      // Broadcast the action that any child controllers should take.
      var action = self.getActionFromKeyEvent(event);
      if (action) {
        event.preventDefault();
        event.stopPropagation();
        self.$scope.$broadcast('md-calendar-parent-action', action);
      }
    });
  };

  /**
   * Hides the vertical scrollbar on the calendar scroller of a child controller by
   * setting the width on the calendar scroller and the `overflow: hidden` wrapper
   * around the scroller, and then setting a padding-right on the scroller equal
   * to the width of the browser's scrollbar.
   *
   * This will cause a reflow.
   *
   * @param {object} childCtrl The child controller whose scrollbar should be hidden.
   */
  CalendarCtrl.prototype.hideVerticalScrollbar = function(childCtrl) {
    var self = this;
    var element = childCtrl.$element[0];
    var scrollMask = element.querySelector('.md-calendar-scroll-mask');

    if (self.width > 0) {
      setWidth();
    } else {
      self.$$rAF(function() {
        var scroller = childCtrl.calendarScroller;

        self.scrollbarWidth = scroller.offsetWidth - scroller.clientWidth;
        self.width = element.querySelector('table').offsetWidth;
        setWidth();
      });
    }

    function setWidth() {
      var width = self.width || FALLBACK_WIDTH;
      var scrollbarWidth = self.scrollbarWidth;
      var scroller = childCtrl.calendarScroller;

      scrollMask.style.width = width + 'px';
      scroller.style.width = (width + scrollbarWidth) + 'px';
      scroller.style.paddingRight = scrollbarWidth + 'px';
    }
  };

  /**
   * Gets an identifier for a date unique to the calendar instance for internal
   * purposes. Not to be displayed.
   * @param {Date} date The date for which the id is being generated
   * @param {string} namespace Namespace for the id. (month, year etc.)
   * @returns {string}
   */
  CalendarCtrl.prototype.getDateId = function(date, namespace) {
    if (!namespace) {
      throw new Error('A namespace for the date id has to be specified.');
    }

    return [
      'md',
      this.id,
      namespace,
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ].join('-');
  };

  /**
   * Util to trigger an extra digest on a parent scope, in order to to ensure that
   * any child virtual repeaters have updated. This is necessary, because the virtual
   * repeater doesn't update the $index the first time around since the content isn't
   * in place yet. The case, in which this is an issue, is when the repeater has less
   * than a page of content (e.g. a month or year view has a min or max date).
   */
  CalendarCtrl.prototype.updateVirtualRepeat = function() {
    var scope = this.$scope;
    var virtualRepeatResizeListener = scope.$on('$md-resize-enable', function() {
      if (!scope.$$phase) {
        scope.$apply();
      }

      virtualRepeatResizeListener();
    });
  };
})();
