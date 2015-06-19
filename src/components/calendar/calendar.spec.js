
describe('md-calendar', function() {
  // When constructing a Date, the month is zero-based. This can be confusing, since people are
  // used to seeing them one-based. So we create these aliases to make reading the tests easier.
  var JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;

  var ngElement, element, scope, pageScope, controller, $animate, $compile, $$rAF;
  var $rootScope, dateLocale, $mdUtil;

  /**
   * To apply a change in the date, a scope $apply() AND a manual triggering of animation
   * callbacks is necessary.
   */
  function applyDateChange() {
    pageScope.$apply();
    $animate.triggerCallbacks();
    $$rAF.flush();

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


  /** Creates and compiles an md-calendar element. */
  function createElement(parentScope) {
    var directiveScope = parentScope || $rootScope.$new();
    var template = '<md-calendar ng-model="myDate"></md-calendar>';
    var attachedElement = angular.element(template);
    document.body.appendChild(attachedElement[0]);
    var newElement = $compile(attachedElement)(directiveScope);
    applyDateChange();
    return newElement;
  }

  beforeEach(module('material.components.calendar', 'ngAnimateMock'));

  beforeEach(inject(function($injector) {
    $animate = $injector.get('$animate');
    $compile = $injector.get('$compile');
    $rootScope = $injector.get('$rootScope');
    $$rAF = $injector.get('$$rAF');
    dateLocale = $injector.get('$$mdDateLocale');
    $mdUtil = $injector.get('$mdUtil');

    pageScope = $rootScope.$new();
    pageScope.myDate = null;

    ngElement = createElement(pageScope);
    element = ngElement[0];
    scope = ngElement.scope();
    controller = ngElement.controller('mdCalendar');
  }));

  afterEach(function() {
    ngElement.remove();
  });

  describe('ngModel binding', function() {

    it('should update the calendar based on ngModel change', function() {
      pageScope.myDate = new Date(2014, MAY, 30);

      applyDateChange();

      var selectedDate = element.querySelector('.md-calendar-selected-date');
      var displayedMonth =
          $mdUtil.getClosest(selectedDate, 'tbody').querySelector('.md-calendar-month-label');

      expect(displayedMonth.textContent).toBe('May 2014');
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
          ['May 2014', '', '', '1', '2', '3'],
          ['4', '5', '6', '7', '8', '9', '10'],
          ['11', '12', '13', '14', '15', '16', '17'],
          ['18', '19', '20', '21', '22', '23', '24'],
          ['25', '26', '27', '28', '29', '30', '31'],
          ['', '', '', '', '', '', ''],
        ];
        expect(calendarDates).toEqual(expectedDates);
      });

      it('should show the month on its own row if the first day is before Tuesday', function() {
        var date = new Date(2014, JUN, 30); // 1st on Sunday
        var monthElement = monthCtrl.buildCalendarForMonth(date);

        var firstRow = monthElement.querySelector('tr');
        expect(extractRowText(firstRow)).toEqual(['Jun 2014']);
      });
    });


    it('should highlight today', function() {
      pageScope.myDate = controller.today;
      applyDateChange();

      var todayElement = element.querySelector('.md-calendar-date-today');
      expect(todayElement).not.toBeNull();
      expect(todayElement.textContent).toBe(controller.today.getDate() + '');
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
