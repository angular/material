
describe('md-calendar', function() {
  // When constructing a Date, the month is zero-based. This can be confusing, since people are
  // used to seeing them one-based. So we create these aliases to make reading the tests easier.
  var JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;

  var ngElement, element, scope, pageScope, calendarMonthController, calendarYearController, calendarController;
  var $rootScope, dateLocale, $mdUtil, $material, $compile, $timeout, keyCodes, dateUtil;

  // List of calendar elements added to the DOM so we can remove them after every test.
  var attachedCalendarElements = [];

  /**
   * To apply a change in the date, a scope $apply() AND a manual triggering of animation
   * callbacks is necessary.
   */
  function applyDateChange() {
    $timeout.flush();
    pageScope.$apply();
    $material.flushOutstandingAnimations();

    // Internally, the calendar sets scrollTop to scroll to the month for a change.
    // The handler for that scroll won't be invoked unless we manually trigger it.
    var activeViewController = calendarMonthController || calendarYearController;
    if (activeViewController) {
      angular.element(activeViewController.calendarScroller).triggerHandler('scroll');
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

  /** Finds a td given a label. */
  function findCellByLabel(monthElement, day) {
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
    var months = element.querySelectorAll('[md-calendar-month-body]');
    var monthHeader = dateLocale.monthHeaderFormatter(date);
    var month;

    for (var i = 0; i < months.length; i++) {
      month = months[i];
      if (month.querySelector('tr:first-child td:first-child').textContent === monthHeader) {
        return month;
      }
    }
    return null;
  }

  /** Find the `tbody` for a year in the calendar. */
  function findYearElement(year) {
    var node = element[0] || element;
    var years = node.querySelectorAll('[md-calendar-year-body]');
    var yearHeader = year.toString();
    var target;

    for (var i = 0; i < years.length; i++) {
      target = years[i];
      if (target.querySelector('.md-calendar-month-label').textContent === yearHeader) {
        return target;
      }
    }
    return null;
  }

  /**
   * Gets the group label for a given date cell.
   * @param {HTMLElement|DocumentView} cell
   * @returns {string}
   */
  function getGroupLabelForDateCell(cell) {
    return $mdUtil.getClosest(cell, 'tbody').querySelector('.md-calendar-month-label').textContent;
  }

  /** Creates and compiles an md-calendar element. */
  function createElement(parentScope, templateOverride) {
    var directiveScope = parentScope || $rootScope.$new();
    var template = templateOverride || '<md-calendar md-min-date="minDate" md-max-date="maxDate" ' +
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


    angular.element(element).triggerHandler({
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
    $timeout = $injector.get('$timeout');
    dateLocale = $injector.get('$mdDateLocale');
    dateUtil = $injector.get('$$mdDateUtil');
    $mdUtil = $injector.get('$mdUtil');
    keyCodes = $injector.get('$mdConstant').KEY_CODE;

    pageScope = $rootScope.$new();
    pageScope.myDate = null;

    ngElement = createElement(pageScope);
    element = ngElement[0];
    scope = ngElement.isolateScope();

    calendarController = ngElement.controller('mdCalendar');
    calendarMonthController = ngElement.find('md-calendar-month').controller('mdCalendarMonth');
    calendarYearController = ngElement.find('md-calendar-year').controller('mdCalendarYear');
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

      expect(getGroupLabelForDateCell(selectedDate)).toBe('May 2014');
      expect(selectedDate.textContent).toBe('30');
    });
  });

  describe('calendar construction', function() {
    it('should be able to switch between views', function() {
      expect(element.querySelector('md-calendar-month')).toBeTruthy();

      calendarController.setCurrentView('year');
      applyDateChange();

      expect(element.querySelector('md-calendar-month')).toBeFalsy();
      expect(element.querySelector('md-calendar-year')).toBeTruthy();
    });

    describe('month view', function() {
      var monthCtrl;

      beforeEach(function() {
        monthCtrl = angular.element(element.querySelector('[md-calendar-month-body]'))
            .controller('mdCalendarMonthBody');
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
          ['May 2014', '', '1', '2', '3'],
          ['4', '5', '6', '7', '8', '9', '10'],
          ['11', '12', '13', '14', '15', '16', '17'],
          ['18', '19', '20', '21', '22', '23', '24'],
          ['25', '26', '27', '28', '29', '30', '31'],
          ['', '', '', '', '', '', ''],
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
          ['May 2014', '1', '2', '3', '4'],
          ['5', '6', '7', '8', '9', '10', '11'],
          ['12', '13', '14', '15', '16', '17', '18'],
          ['19', '20', '21', '22', '23', '24', '25'],
          ['26', '27', '28', '29', '30', '31', ''],
          ['', '', '', '', '', '', ''],
        ];
        expect(calendarDates).toEqual(expectedDates);
        dateLocale.firstDayOfWeek = 0;
      });

      it('should show the month on its own row if the first day is before Tuesday', function() {
        var date = new Date(2014, JUN, 30); // 1st on Sunday
        var monthElement = monthCtrl.buildCalendarForMonth(date);

        var firstRow = monthElement.querySelector('tr');
        expect(extractRowText(firstRow)).toEqual(['Jun 2014']);
      });

      it('should apply the locale-specific month header formatter', function() {
        var date = new Date(2014, JUN, 30);
        spyOn(dateLocale, 'monthHeaderFormatter').and.callFake(function(expectedDateArg) {
          expect(expectedDateArg).toBeSameDayAs(date);
          return 'Junz 2014';
        });
        var monthElement = monthCtrl.buildCalendarForMonth(date);

        var monthHeader = monthElement.querySelector('tr');
        expect(monthHeader.textContent).toEqual('Junz 2014');
      });

      it('should update the model on cell click', function() {
        spyOn(scope, '$emit');
        var date = new Date(2014, MAY, 30);
        var monthElement = monthCtrl.buildCalendarForMonth(date);
        var expectedDate = new Date(2014, MAY, 5);
        findCellByLabel(monthElement, 5).click();
        expect(pageScope.myDate).toBeSameDayAs(expectedDate);
        expect(scope.$emit).toHaveBeenCalledWith('md-calendar-change', expectedDate);
      });

      it('should disable any dates outside the min/max date range', function() {
        pageScope.minDate = new Date(2014, JUN, 10);
        pageScope.maxDate = new Date(2014, JUN, 20);
        pageScope.$apply();

        var monthElement = monthCtrl.buildCalendarForMonth(new Date(2014, JUN, 15));
        expect(findCellByLabel(monthElement, 5)).toHaveClass('md-calendar-date-disabled');
        expect(findCellByLabel(monthElement, 10)).not.toHaveClass('md-calendar-date-disabled');
        expect(findCellByLabel(monthElement, 20)).not.toHaveClass('md-calendar-date-disabled');
        expect(findCellByLabel(monthElement, 25)).toHaveClass('md-calendar-date-disabled');
      });

      it('should not respond to disabled cell clicks', function() {
        var initialDate = new Date(2014, JUN, 15);
        pageScope.myDate = initialDate;
        pageScope.minDate = new Date(2014, JUN, 10);
        pageScope.maxDate = new Date(2014, JUN, 20);
        pageScope.$apply();

        var monthElement = monthCtrl.buildCalendarForMonth(pageScope.myDate);
        findCellByLabel(monthElement, 5).click();
        expect(pageScope.myDate).toBeSameDayAs(initialDate);
      });

      it('should ensure that all month elements have a height when the max ' +
        'date is in the same month as the current date', function() {

        ngElement.remove();
        var newScope = $rootScope.$new();
        newScope.myDate = new Date(2016, JUN, 15);
        newScope.maxDate = new Date(2016, JUN, 20);
        element = createElement(newScope)[0];
        applyDateChange();

        var monthWrapper = angular.element(element.querySelector('md-calendar-month'));
        var scroller = monthWrapper.controller('mdCalendarMonth').calendarScroller;

        scroller.scrollTop -= 50;
        angular.element(scroller).triggerHandler('scroll');

        var monthElements = $mdUtil.nodesToArray(
          element.querySelectorAll('[md-calendar-month-body]')
        );

        expect(monthElements.every(function(currentMonthElement) {
          return currentMonthElement.offsetHeight > 0;
        })).toBe(true);
      });

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

      it('should highlight today', function() {
        pageScope.myDate = calendarController.today;
        applyDateChange();

        var todayElement = element.querySelector('.md-calendar-date-today');
        expect(todayElement).not.toBeNull();
        expect(todayElement.textContent).toBe(calendarController.today.getDate() + '');
      });

      it('should highlight the selected date', function() {
        pageScope.myDate = calendarController.selectedDate = new Date(2014, JUN, 30);
        applyDateChange();

        var selectedElement = element.querySelector('.md-calendar-selected-date');
        expect(selectedElement).not.toBeNull();
        expect(selectedElement.textContent).toBe(calendarController.selectedDate.getDate() + '');
      });

      it('should block month transitions when a month transition is happening', function() {
        var earlierDate = new Date(2014, FEB, 11);
        var laterDate = new Date(2014, MAR, 11);

        calendarMonthController.changeDisplayDate(earlierDate);
        expect(calendarController.displayDate).toBeSameDayAs(earlierDate);

        calendarMonthController.changeDisplayDate(laterDate);
        expect(calendarController.displayDate).toBeSameDayAs(earlierDate);

        $material.flushOutstandingAnimations();
        calendarMonthController.changeDisplayDate(laterDate);
        expect(calendarController.displayDate).toBeSameDayAs(laterDate);
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
    });

    describe('year view', function() {
      var yearCtrl;

      beforeEach(function() {
        calendarController.setCurrentView('year');
        applyDateChange();

        yearCtrl = angular.element(element.querySelector('[md-calendar-year-body]'))
            .controller('mdCalendarYearBody');
      });

      it('should render a year correctly as a table', function() {
        var date = new Date(2014, MAY, 30);
        var yearElement = yearCtrl.buildCalendarForYear(date);

        var calendarRows = yearElement.querySelectorAll('tr');
        var calendarDates = [];

        angular.forEach(calendarRows, function(tr) {
          calendarDates.push(extractRowText(tr));
        });

        var expectedDates = [
          ['2014', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          ['', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        ];

        expect(calendarDates).toEqual(expectedDates);
      });

      it('should jump to the first day of the relevant month on cell click', function() {
        var date = new Date(2014, MAY, 30);
        var yearElement = yearCtrl.buildCalendarForYear(date);
        var expectedDate = new Date(2014, DEC, 1);

        findCellByLabel(yearElement, 'Dec').click();
        applyDateChange();
        expect(calendarController.displayDate).toBeSameDayAs(expectedDate);
        expect(calendarController.currentView).not.toBe('year');
      });

      it('should disable any months outside the min/max date range', function() {
        pageScope.minDate = new Date(2014, JUN, 10);
        pageScope.maxDate = new Date(2014, SEP, 20);
        pageScope.$apply();

        var yearElement = yearCtrl.buildCalendarForYear(new Date(2014, JAN, 1));
        var disabledClass = 'md-calendar-date-disabled';
        expect(findCellByLabel(yearElement, 'Jan')).toHaveClass(disabledClass);
        expect(findCellByLabel(yearElement, 'Aug')).not.toHaveClass(disabledClass);
        expect(findCellByLabel(yearElement, 'Oct')).toHaveClass(disabledClass);
      });

      it('should not respond to disabled cell clicks', function() {
        var initialDate = new Date(2014, JUN, 15);
        calendarController.displayDate = initialDate;
        pageScope.minDate = new Date(2014, FEB, 10);
        pageScope.maxDate = new Date(2014, AUG, 20);
        pageScope.$apply();

        var yearElement = yearCtrl.buildCalendarForYear(calendarController.displayDate);
        findCellByLabel(yearElement, 'Jan').click();
        expect(calendarController.displayDate).toBe(initialDate);
      });

      it('should highlight the current month', function() {
        var todayElement = element.querySelector('.md-calendar-date-today');
        expect(todayElement).not.toBeNull();
        expect(todayElement.textContent).toBe(dateLocale.shortMonths[calendarController.today.getMonth()]);
      });

      it('should highlight the month of the selected date', function() {
        ngElement.remove();
        var newScope = $rootScope.$new();
        newScope.myDate = new Date(2014, JUN, 30);
        element = createElement(newScope)[0];
        angular.element(element).controller('mdCalendar').setCurrentView('year');
        applyDateChange();

        var selectedElement = element.querySelector('.md-calendar-selected-date');
        expect(selectedElement).not.toBeNull();
        expect(selectedElement.textContent).toBe('Jun');
      });

      it('should not render any years before the min date', function() {
        ngElement.remove();
        var newScope = $rootScope.$new();
        newScope.minDate = new Date(2014, JUN, 5);
        newScope.myDate = new Date(2014, JUL, 15);
        element = createElement(newScope);
        element.controller('mdCalendar').setCurrentView('year');
        applyDateChange();

        expect(findYearElement(2014)).not.toBeNull();
        expect(findYearElement(2013)).toBeNull();
      });

      it('should ensure that all year elements have a height when the ' +
        'current date is in the same month as the max date', function() {

        ngElement.remove();
        var newScope = $rootScope.$new();
        newScope.myDate = new Date(2016, JUN, 15);
        newScope.maxDate = new Date(2016, JUN, 20);
        element = createElement(newScope);
        element.controller('mdCalendar').setCurrentView('year');
        applyDateChange();

        var yearWrapper = angular.element(element[0].querySelector('md-calendar-year'));
        var scroller = yearWrapper.controller('mdCalendarYear').calendarScroller;

        scroller.scrollTop -= 50;
        angular.element(scroller).triggerHandler('scroll');

        var yearElements = $mdUtil.nodesToArray(
          element[0].querySelectorAll('[md-calendar-year-body]')
        );

        expect(yearElements.every(function(currentYearElement) {
          return currentYearElement.offsetHeight > 0;
        })).toBe(true);
      });
    });

    it('should have ids for date elements unique to the directive instance', function() {
      var controller = ngElement.controller('mdCalendar');
      pageScope.myDate = calendarController.today;
      applyDateChange();

      var otherScope = $rootScope.$new();
      var day = 15;

      otherScope.myDate = calendarController.today;
      var otherNgElement = createElement(otherScope);

      var monthElement = element.querySelector('.md-calendar-month');
      var dateElement = findCellByLabel(monthElement, day);

      var otherMonthElement = otherNgElement[0].querySelector('.md-calendar-month');
      var otherDateElement = findCellByLabel(otherMonthElement, day);

      expect(dateElement.id).not.toEqual(otherDateElement.id);
    });
  });

  describe('keyboard events', function() {
    describe('month view', function() {
      it('should navigate around the calendar based on key presses', function() {
        pageScope.myDate = new Date(2014, FEB, 11);
        applyDateChange();

        var selectedDate = element.querySelector('.md-calendar-selected-date');
        selectedDate.focus();

        dispatchKeyEvent(keyCodes.LEFT_ARROW);
        expect(getFocusedDateElement().textContent).toBe('10');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.UP_ARROW);
        expect(getFocusedDateElement().textContent).toBe('3');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.RIGHT_ARROW);
        expect(getFocusedDateElement().textContent).toBe('4');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.DOWN_ARROW);
        expect(getFocusedDateElement().textContent).toBe('11');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.HOME);
        expect(getFocusedDateElement().textContent).toBe('1');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.END);
        expect(getFocusedDateElement().textContent).toBe('28');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.RIGHT_ARROW);
        expect(getFocusedDateElement().textContent).toBe('1');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Mar 2014');

        dispatchKeyEvent(keyCodes.PAGE_UP);
        expect(getFocusedDateElement().textContent).toBe('1');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.PAGE_DOWN);
        expect(getFocusedDateElement().textContent).toBe('1');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Mar 2014');

        dispatchKeyEvent(keyCodes.UP_ARROW, {meta: true});
        expect(getFocusedDateElement().textContent).toBe('1');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.DOWN_ARROW, {meta: true});
        expect(getFocusedDateElement().textContent).toBe('1');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Mar 2014');

        dispatchKeyEvent(keyCodes.ENTER);
        applyDateChange();
        expect(calendarController.selectedDate).toBeSameDayAs(new Date(2014, MAR, 1));
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
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.LEFT_ARROW);
        expect(getFocusedDateElement().textContent).toBe('5');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.DOWN_ARROW);
        expect(getFocusedDateElement().textContent).toBe('10');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.RIGHT_ARROW);
        expect(getFocusedDateElement().textContent).toBe('10');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.UP_ARROW, {meta: true});
        expect(getFocusedDateElement().textContent).toBe('5');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');

        dispatchKeyEvent(keyCodes.DOWN_ARROW, {meta: true});
        expect(getFocusedDateElement().textContent).toBe('10');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Feb 2014');
      });
    });

    describe('year view', function() {
      it('should navigate around the calendar based on key presses', function() {
        pageScope.myDate = new Date(2014, JUN, 1);
        calendarController.setCurrentView('year');
        applyDateChange();

        var selectedDate = element.querySelector('.md-calendar-selected-date');
        selectedDate.focus();

        dispatchKeyEvent(keyCodes.LEFT_ARROW);
        expect(getFocusedDateElement().textContent).toBe('May');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('2014');

        dispatchKeyEvent(keyCodes.UP_ARROW);
        expect(getFocusedDateElement().textContent).toBe('Nov');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('2013');

        dispatchKeyEvent(keyCodes.RIGHT_ARROW);
        expect(getFocusedDateElement().textContent).toBe('Dec');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('2013');

        dispatchKeyEvent(keyCodes.DOWN_ARROW);
        expect(getFocusedDateElement().textContent).toBe('Jun');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('2014');

        dispatchKeyEvent(keyCodes.ENTER);
        applyDateChange();
        expect(calendarController.displayDate).toBeSameDayAs(new Date(2014, JUN, 1));
        expect(calendarController.currentView).toBe('month');
        expect(getFocusedDateElement().textContent).toBe('1');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('Jun 2014');
      });

      it('should restrict date navigation to min/max dates', function() {
        pageScope.minDate = new Date(2014, JAN, 30);
        pageScope.maxDate = new Date(2014, SEP, 1);
        pageScope.myDate = new Date(2014, JUN, 1);
        calendarController.setCurrentView('year');
        applyDateChange();

        var selectedDate = element.querySelector('.md-calendar-selected-date');
        selectedDate.focus();

        dispatchKeyEvent(keyCodes.UP_ARROW);
        expect(getFocusedDateElement().textContent).toBe('Jan');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('2014');

        dispatchKeyEvent(keyCodes.LEFT_ARROW);
        expect(getFocusedDateElement().textContent).toBe('Jan');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('2014');

        dispatchKeyEvent(keyCodes.DOWN_ARROW);
        dispatchKeyEvent(keyCodes.RIGHT_ARROW);
        expect(getFocusedDateElement().textContent).toBe('Aug');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('2014');

        dispatchKeyEvent(keyCodes.RIGHT_ARROW);
        expect(getFocusedDateElement().textContent).toBe('Sep');
        expect(getGroupLabelForDateCell(getFocusedDateElement())).toBe('2014');
      });
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
    expect(nextMonth.querySelector('.md-calendar-month-label')).toHaveClass(
        'md-calendar-month-label-disabled');
    expect(nextMonth.querySelectorAll('tr').length).toBe(1);

    var dates = nextMonth.querySelectorAll('.md-calendar-date');
    for (var i = 0; i < dates.length; i++) {
      date = dates[i];
      if (date.textContent) {
        expect(date).toHaveClass('md-calendar-date-disabled');
      }
    }
  });

  it('should have a configurable default view', function() {
    ngElement.remove();
    var calendar = createElement(null, '<md-calendar ng-model="myDate" md-current-view="year"></md-calendar>')[0];

    expect(calendar.querySelector('md-calendar-month')).toBeFalsy();
    expect(calendar.querySelector('md-calendar-year')).toBeTruthy();
  });
});
