
describe('md-calendar', function() {
  // When constructing a Date, the month is zero-based. This can be confusing, since people are
  // used to seeing them one-based. So we create these aliases to make reading the tests easier.
  var JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;

  var ngElement, element, scope, pageScope, controller, $animate, $compile;
  var $rootScope, dateLocale;

  /**
   * To apply a change in the date, a scope $apply() AND a manual triggering of animation
   * callbacks is necessary.
   */
  function applyDateChange() {
    pageScope.$apply();
    $animate.triggerCallbacks();
  }

  /**
   * Extracts text as an array (one element per cell) from a tr element.
   */
  function extractRowText(tr) {
    var cellContents = [];
    angular.forEach(tr.children, function(tableElement) {
      cellContents.push(tableElement.textContent);
    });

    return cellContents;
  }

  /**
   * Finds a date td given a day of the month from an .md-calendar-month element.
   */
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
   * Creates and compiles an md-calendar element.
   */
  function createElement(parentScope) {
    var directiveScope = parentScope || $rootScope.$new();
    var template = '<md-calendar ng-model="myDate"></md-calendar>';
    var newElement = $compile(template)(directiveScope);
    directiveScope.$apply();
    return newElement;
  }

  beforeEach(module('material.components.calendar', 'ngAnimateMock'));

  beforeEach(inject(function($injector) {
    $animate = $injector.get('$animate');
    $compile = $injector.get('$compile');
    $rootScope = $injector.get('$rootScope');
    dateLocale = $injector.get('$$mdDateLocale');

    pageScope = $rootScope.$new();
    pageScope.myDate = null;

    ngElement = createElement(pageScope);
    element = ngElement[0];
    scope = ngElement.scope();
    controller = ngElement.controller('mdCalendar');
  }));

  describe('ngModel binding', function() {

    it('should update the calendar based on ngModel change', function() {
      pageScope.myDate = new Date(2014, MAY, 30);
      applyDateChange();

      var displayedMonth = element.querySelector('.md-calendar-month-label');
      var selectedDate = element.querySelector('.md-calendar-selected-date');

      expect(displayedMonth.textContent).toBe('May');
      expect(selectedDate.textContent).toBe('30');
    });

  });

  describe('calendar construction', function() {
    describe('weeks header', function() {
      it('should display the weeks header in the first row', function() {
        var header = element.querySelector('.md-calendar-day-header tr');

        expect(extractRowText(header)).toEqual(['S', 'M', 'T', 'W', 'T', 'F' ,'S']);
      });

      it('should use $$mdDateLocale.shortDays as weeks header values', function() {
        var oldShortDays = dateLocale.shortDays;
        dateLocale.shortDays = ['SZ', 'MZ', 'TZ', 'WZ', 'TZ', 'FZ', 'SZ'];

        var newElement = createElement()[0];
        var header = newElement.querySelector('.md-calendar-day-header tr');

        expect(extractRowText(header)).toEqual(['SZ', 'MZ', 'TZ', 'WZ', 'TZ', 'FZ','SZ']);
        dateLocale.shortDays = oldShortDays;
      });
    });

    describe('#buildCalendarForMonth', function() {
      it('should render a month correctly as a table', function() {
        var date = new Date(2014, MAY, 30);
        var monthElement = controller.buildCalendarForMonth(date);

        var calendarRows = monthElement.querySelectorAll('tr');
        var calendarDates = [];

        angular.forEach(calendarRows, function(tr) {
          calendarDates.push(extractRowText(tr));
        });

        var expectedDates = [
          ['May', '', '', '1', '2', '3'],
          ['4', '5', '6', '7', '8', '9', '10'],
          ['11', '12', '13', '14', '15', '16', '17'],
          ['18', '19', '20', '21', '22', '23', '24'],
          ['25', '26', '27', '28', '29', '30', '31'],
        ];
        expect(calendarDates).toEqual(expectedDates);
      });

      it('should show the month on its own row if the first day is before Tuesday', function() {
        var date = new Date(2014, JUN, 30); // 1st on Sunday
        var monthElement = controller.buildCalendarForMonth(date);

        var firstRow = monthElement.querySelector('tr');
        expect(extractRowText(firstRow)).toEqual(['Jun']);
      });
    });


    it('should highlight today', function() {
      pageScope.myDate = controller.today;
      applyDateChange();

      var monthElement = element.querySelector('.md-calendar-month');
      var day = controller.today.getDate();

      var dateElement = findDateElement(monthElement, day);
      expect(dateElement.classList.contains('md-calendar-date-today')).toBe(true);
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

  });

  describe('focus behavior', function() {

  });

  describe('a11y announcements', function() {
  });

  describe('i18n', function() {
  });
});
