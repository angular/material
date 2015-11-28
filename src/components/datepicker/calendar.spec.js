
describe('md-calendar', function() {
  // When constructing a Date, the month is zero-based. This can be confusing, since people are
  // used to seeing them one-based. So we create these aliases to make reading the tests easier.
  var JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;

  var ngElement, element, scope, pageScope, controller, $material, $compile, $$rAF;
  var $rootScope, dateLocale, $mdUtil, keyCodes, dateUtil;

  // List of calendar elements added to the DOM so we can remove them after every test.
  var attachedCalendarElements = [];

  /**
   * To apply a change in the date, a scope $apply() AND a manual triggering of animation
   * callbacks is necessary.
   */
  function applyDateChange() {
    pageScope.$apply();
    $material.flushOutstandingAnimations();

    // Internally, the calendar sets scrollTop to scroll to the month for a change.
    // The handler for that scroll won't be invoked unless we manually trigger it.
    if (controller) {
      angular.element(controller.calendarScroller).triggerHandler('scroll');
    }
  }

  /** Extracts text as an array (one element per cell) from a tr element. */
  function extractRowText(tr) {
    var cellContents = [];
    angular.forEach(tr.children, function(tableElement) {
      cellContents.push(tableElement.textContent);
    });

    return cellContents;
  }

  /** Finds a date td given a day of the month from an .md-calendar-month element. */
  function findDateElement(monthElement, day) {
    var tds = monthElement.querySelectorAll('td');
    var td;

    for (var i = 0; i < tds.length; i++) {
      td = tds[i];
      if (td.textContent === day.toString()) {
        return td;
      }
    }
  }

  /**
   * Finds a month `tbody` in the calendar element given a date.
   */
  function findMonthElement(date) {
    var months = element.querySelectorAll('[md-calendar-month]');
    var monthHeader = dateLocale.monthHeaderFormatter(date);
    var month;

    for (var i = 0; i < months.length; i++) {
      month = months[i];
      if (month.querySelector('tr:first-child').getAttribute('data-month') === monthHeader) {
        return month;
      }
    }
    return null;
  }

  /** Creates and compiles an md-calendar element. */
  function createElement(parentScope) {
    var directiveScope = parentScope || $rootScope.$new();
    var template = '<md-calendar md-min-date="minDate" md-max-date="maxDate" ' +
        'ng-model="myDate"></md-calendar>';
    var attachedElement = angular.element(template);
    document.body.appendChild(attachedElement[0]);
    var newElement = $compile(attachedElement)(directiveScope);
    attachedCalendarElements.push(newElement);
    applyDateChange();
    return newElement;
  }

  /**
   * Dispatches a KeyboardEvent for the calendar.
   * @param {number} keyCode
   * @param {Object=} opt_modifiers
   */
  function dispatchKeyEvent(keyCode, opt_modifiers) {
    var mod = opt_modifiers || {};

    angular.element(controller.$element).triggerHandler({
      type: 'keydown',
      keyCode: keyCode,
      which: keyCode,
      ctrlKey: mod.ctrl,
      altKey: mod.alt,
      metaKey: mod.meta,
      shortKey: mod.shift
    });
  }

  function getFocusedDateElement() {
    return element.querySelector('.md-focus');
  }

  beforeEach(module('material.components.datepicker', 'ngAnimateMock'));

  beforeEach(inject(function($injector) {
    jasmine.addMatchers({
      toBeSameDayAs: function() {
        return {
          compare: function(actual, expected) {
            var results = {
              pass: dateUtil.isSameDay(actual, expected)
            };

            var negation = !results.pass ? '' : 'not ';

            results.message = [
              'Expected',
              actual,
              negation + 'to be the same day as',
              expected
            ].join(' ');

            return results;
          }
        };
      }
    });

    $material = $injector.get('$material');
    $compile = $injector.get('$compile');
    $rootScope = $injector.get('$rootScope');
    $$rAF = $injector.get('$$rAF');
    dateLocale = $injector.get('$mdDateLocale');
    dateUtil = $injector.get('$$mdDateUtil');
    $mdUtil = $injector.get('$mdUtil');
    keyCodes = $injector.get('$mdConstant').KEY_CODE;

    pageScope = $rootScope.$new();
    pageScope.myDate = null;

    ngElement = createElement(pageScope);
    element = ngElement[0];
    scope = ngElement.isolateScope();
    controller = ngElement.controller('mdCalendar');
  }));

  afterEach(function() {
    attachedCalendarElements.forEach(function(element) {
      element.remove();
    });
    attachedCalendarElements = [];
  });

  describe('ngModel binding', function() {
    it('should update the calendar based on ngModel change', function() {
      pageScope.myDate = new Date(2014, MAY, 30);
      applyDateChange();

      var selectedDate = element.querySelector('.md-calendar-selected-date');

      expect(selectedDate.textContent).toBe('30');
    });
  });

  describe('calendar construction', function() {
    describe('weeks header', function() {
      it('should display the weeks header in the first row', function() {
        var header = element.querySelector('.md-calendar-day-header tr');

        expect(extractRowText(header)).toEqual(['S', 'M', 'T', 'W', 'T', 'F' ,'S']);
      });

      it('should use $mdDateLocale.shortDays as weeks header values', function() {
        var oldShortDays = dateLocale.shortDays;
        dateLocale.shortDays = ['SZ', 'MZ', 'TZ', 'WZ', 'TZ', 'FZ', 'SZ'];

        var newElement = createElement()[0];
        var header = newElement.querySelector('.md-calendar-day-header tr');

        expect(extractRowText(header)).toEqual(['SZ', 'MZ', 'TZ', 'WZ', 'TZ', 'FZ','SZ']);
        dateLocale.shortDays = oldShortDays;
      });

      it('should allow changing the first day of the week to Monday', function() {
        var oldShortDays = dateLocale.shortDays;
        dateLocale.shortDays = ['SZ', 'MZ', 'TZ', 'WZ', 'TZ', 'FZ', 'SZ'];
        dateLocale.firstDayOfWeek = 1;

        var newElement = createElement()[0];
        var header = newElement.querySelector('.md-calendar-day-header tr');

        expect(extractRowText(header)).toEqual(['MZ', 'TZ', 'WZ', 'TZ', 'FZ','SZ', 'SZ']);
        dateLocale.shortDays = oldShortDays;
        dateLocale.firstDayOfWeek = 0;
      });
    });

    describe('#buildCalendarForMonth', function() {
      var monthCtrl;

      beforeEach(function() {
        monthCtrl = angular.element(element.querySelector('[md-calendar-month]'))
            .controller('mdCalendarMonth');
      });

      it('should render a month correctly as a table', function() {
        var date = new Date(2014, MAY, 30);
        var monthElement = monthCtrl.buildCalendarForMonth(date);

        var calendarRows = monthElement.querySelectorAll('tr');
        var calendarDates = [];

        angular.forEach(calendarRows, function(tr) {
          calendarDates.push(extractRowText(tr));
        });

        var expectedDates = [
          ['', '', '', '', '1', '2', '3'],
          ['4', '5', '6', '7', '8', '9', '10'],
          ['11', '12', '13', '14', '15', '16', '17'],
          ['18', '19', '20', '21', '22', '23', '24'],
          ['25', '26', '27', '28', '29', '30', '31'],
          ['', '', '', '', '', '', '']
        ];
        expect(calendarDates).toEqual(expectedDates);
      });

      it('should render a month correctly when the first day of the week is Monday', function() {
        dateLocale.firstDayOfWeek = 1;
        var date = new Date(2014, MAY, 30);
        var monthElement = monthCtrl.buildCalendarForMonth(date);

        var calendarRows = monthElement.querySelectorAll('tr');
        var calendarDates = [];

        angular.forEach(calendarRows, function(tr) {
          calendarDates.push(extractRowText(tr));
        });

        var expectedDates = [
          ['', '', '', '1', '2', '3', '4'],
          ['5', '6', '7', '8', '9', '10', '11'],
          ['12', '13', '14', '15', '16', '17', '18'],
          ['19', '20', '21', '22', '23', '24', '25'],
          ['26', '27', '28', '29', '30', '31', ''],
          ['', '', '', '', '', '', '']
        ];
        expect(calendarDates).toEqual(expectedDates);
        dateLocale.firstDayOfWeek = 0;
      });

      it('should update the model on cell click', function() {
        spyOn(scope, '$emit');
        var date = new Date(2014, MAY, 30);
        var monthElement = monthCtrl.buildCalendarForMonth(date);
        var expectedDate = new Date(2014, MAY, 5);
        findDateElement(monthElement, 5).click();
        expect(pageScope.myDate).toBeSameDayAs(expectedDate);
        expect(scope.$emit).toHaveBeenCalledWith('md-calendar-change', expectedDate);
      });

      it('should disable any dates outside the min/max date range', function() {
        pageScope.minDate = new Date(2014, JUN, 10);
        pageScope.maxDate = new Date(2014, JUN, 20);
        pageScope.$apply();

        var monthElement = monthCtrl.buildCalendarForMonth(new Date(2014, JUN, 15));
        expect(findDateElement(monthElement, 5)).toHaveClass('md-calendar-date-disabled');
        expect(findDateElement(monthElement, 10)).not.toHaveClass('md-calendar-date-disabled');
        expect(findDateElement(monthElement, 20)).not.toHaveClass('md-calendar-date-disabled');
        expect(findDateElement(monthElement, 25)).toHaveClass('md-calendar-date-disabled');
      });

      it('should not respond to disabled cell clicks', function() {
        var initialDate = new Date(2014, JUN, 15);
        pageScope.myDate = initialDate;
        pageScope.minDate = new Date(2014, JUN, 10);
        pageScope.maxDate = new Date(2014, JUN, 20);
        pageScope.$apply();

        var monthElement = monthCtrl.buildCalendarForMonth(pageScope.myDate);
        findDateElement(monthElement, 5).click();
        expect(pageScope.myDate).toBeSameDayAs(initialDate);
      });
    });

    it('should highlight today', function() {
      pageScope.myDate = controller.today;
      applyDateChange();

      var todayElement = element.querySelector('.md-calendar-date-today');
      expect(todayElement).not.toBeNull();
      expect(todayElement.textContent).toBe(controller.today.getDate() + '');
    });

    it('should highlight the selected date', function() {
      pageScope.myDate = controller.selectedDate = new Date(2014, JUN, 30);
      applyDateChange();

      var selectedElement = element.querySelector('.md-calendar-selected-date');
      expect(selectedElement).not.toBeNull();
      expect(selectedElement.textContent).toBe(controller.selectedDate.getDate() + '');

    });

    it('should have ids for date elements unique to the directive instance', function() {
      pageScope.myDate = controller.today;
      applyDateChange();

      var otherScope = $rootScope.$new();

      otherScope.myDate = controller.today;
      var otherNgElement = createElement(otherScope);

      var monthElement = element.querySelector('.md-calendar-month');
      var day = controller.today.getDate();
      var dateElement = findDateElement(monthElement, day);

      var otherMonthElement = otherNgElement[0].querySelector('.md-calendar-month');
      var otherDateElement = findDateElement(otherMonthElement, day);

      expect(dateElement.id).not.toEqual(otherDateElement.id);
    });
  });

  describe('keyboard events', function() {
    it('should navigate around the calendar based on key presses', function() {
      pageScope.myDate = new Date(2014, FEB, 11);
      applyDateChange();

      var selectedDate = element.querySelector('.md-calendar-selected-date');
      selectedDate.focus();

      dispatchKeyEvent(keyCodes.LEFT_ARROW);
      expect(getFocusedDateElement().textContent).toBe('10');

      dispatchKeyEvent(keyCodes.UP_ARROW);
      expect(getFocusedDateElement().textContent).toBe('3');

      dispatchKeyEvent(keyCodes.RIGHT_ARROW);
      expect(getFocusedDateElement().textContent).toBe('4');

      dispatchKeyEvent(keyCodes.DOWN_ARROW);
      expect(getFocusedDateElement().textContent).toBe('11');

      dispatchKeyEvent(keyCodes.HOME);
      expect(getFocusedDateElement().textContent).toBe('1');

      dispatchKeyEvent(keyCodes.END);
      expect(getFocusedDateElement().textContent).toBe('28');

      dispatchKeyEvent(keyCodes.RIGHT_ARROW);
      expect(getFocusedDateElement().textContent).toBe('1');

      dispatchKeyEvent(keyCodes.PAGE_UP);
      expect(getFocusedDateElement().textContent).toBe('1');

      dispatchKeyEvent(keyCodes.PAGE_DOWN);
      expect(getFocusedDateElement().textContent).toBe('1');

      dispatchKeyEvent(keyCodes.UP_ARROW, {meta: true});
      expect(getFocusedDateElement().textContent).toBe('1');

      dispatchKeyEvent(keyCodes.DOWN_ARROW, {meta: true});
      expect(getFocusedDateElement().textContent).toBe('1');

      dispatchKeyEvent(keyCodes.ENTER);
      applyDateChange();
      expect(controller.selectedDate).toBeSameDayAs(new Date(2014, MAR, 1));
    });

    it('should restrict date navigation to min/max dates', function() {
      pageScope.minDate = new Date(2014, FEB, 5);
      pageScope.maxDate = new Date(2014, FEB, 10);
      pageScope.myDate = new Date(2014, FEB, 8);
      applyDateChange();

      var selectedDate = element.querySelector('.md-calendar-selected-date');
      selectedDate.focus();

      dispatchKeyEvent(keyCodes.UP_ARROW);
      expect(getFocusedDateElement().textContent).toBe('5');

      dispatchKeyEvent(keyCodes.LEFT_ARROW);
      expect(getFocusedDateElement().textContent).toBe('5');

      dispatchKeyEvent(keyCodes.DOWN_ARROW);
      expect(getFocusedDateElement().textContent).toBe('10');

      dispatchKeyEvent(keyCodes.RIGHT_ARROW);
      expect(getFocusedDateElement().textContent).toBe('10');

      dispatchKeyEvent(keyCodes.UP_ARROW, {meta: true});
      expect(getFocusedDateElement().textContent).toBe('5');

      dispatchKeyEvent(keyCodes.DOWN_ARROW, {meta: true});
      expect(getFocusedDateElement().textContent).toBe('10');

    });

    it('should fire an event when escape is pressed', function() {
      var escapeHandler = jasmine.createSpy('escapeHandler');
      pageScope.$on('md-calendar-close', escapeHandler);

      pageScope.myDate = new Date(2014, FEB, 11);
      applyDateChange();
      var selectedDate = element.querySelector('.md-calendar-selected-date');
      selectedDate.focus();

      dispatchKeyEvent(keyCodes.ESCAPE);
      pageScope.$apply();
      expect(escapeHandler).toHaveBeenCalled();
    });
  });

  it('should block month transitions when a month transition is happening', function() {
    var earlierDate = new Date(2014, FEB, 11);
    var laterDate = new Date(2014, MAR, 11);

    controller.changeDisplayDate(earlierDate);
    expect(controller.displayDate).toBeSameDayAs(earlierDate);

    controller.changeDisplayDate(laterDate);
    expect(controller.displayDate).toBeSameDayAs(earlierDate);

    $material.flushOutstandingAnimations();
    controller.changeDisplayDate(laterDate);
    expect(controller.displayDate).toBeSameDayAs(laterDate);
  });

  it('should not render any months before the min date', function() {
    ngElement.remove();
    var newScope = $rootScope.$new();
    newScope.minDate = new Date(2014, JUN, 5);
    newScope.myDate = new Date(2014, JUN, 15);
    newScope.$apply();
    element = createElement(newScope)[0];

    expect(findMonthElement(new Date(2014, JUL, 1))).not.toBeNull();
    expect(findMonthElement(new Date(2014, JUN, 1))).not.toBeNull();
    expect(findMonthElement(new Date(2014, MAY, 1))).toBeNull();
  });

  it('should render one single-row month of disabled cells after the max date', function() {
    ngElement.remove();
    var newScope = $rootScope.$new();
    newScope.myDate = new Date(2014, APR, 15);
    newScope.maxDate = new Date(2014, APR, 30);
    newScope.$apply();
    element = createElement(newScope)[0];

    expect(findMonthElement(new Date(2014, MAR, 1))).not.toBeNull();
    expect(findMonthElement(new Date(2014, APR, 1))).not.toBeNull();

    // First date of May 2014 on Thursday (i.e. has 3 dates on the first row).
    var nextMonth = findMonthElement(new Date(2014, MAY, 1));
    expect(nextMonth).not.toBeNull();
    expect(nextMonth.querySelectorAll('tr').length).toBe(1);

    var dates = nextMonth.querySelectorAll('.md-calendar-date');
    for (var i = 0; i < dates.length; i++) {
      date = dates[i];
      if (date.textContent) {
        expect(date).toHaveClass('md-calendar-date-disabled');
      }
    }
  });

  describe('month-selector functions', function() {

    it('should increase the current month scroll distance', function() {
      var lastScrollDistance = controller.getScrollDistanceMonth();

      // One Month Row is 265 Pixels height, so we should scroll more than the half of that (265 / 2 = 132.5)
      // Because we round the scrollTop, so we should add one half pixel
      controller.calendarScroller.scrollTop += 133;

      expect(controller.getScrollDistanceMonth()).toBeGreaterThan(lastScrollDistance);
    });

    it('should increase the scroll month on executing increaseMonth', function() {
      var lastScrollMonth = controller.getScrollMonth().getMonth();

      controller.increaseMonth();

      expect(controller.getScrollMonth().getMonth()).toBeGreaterThan(lastScrollMonth);
    });

    it('should decrease the scroll month on executing decreaseMonth', function() {
      var lastScrollMonth = controller.getScrollMonth().getMonth();

      controller.decreaseMonth();

      expect(controller.getScrollMonth().getMonth()).toBeLessThan(lastScrollMonth);
    });

    it('should change the month selector label on scrolling', function() {
      var lastLabel = controller.getFormatedScrollMonth();

      controller.calendarScroller.scrollTop += 133;
      angular.element(controller.calendarScroller).triggerHandler('scroll');

      expect(lastLabel).not.toBe(controller.getFormatedScrollMonth());
    });
  });
});
