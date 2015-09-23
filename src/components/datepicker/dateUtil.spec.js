
describe('$$mdDateUtil', function() {
  // When constructing a Date, the month is zero-based. This can be confusing, since people are
  // used to seeing them one-based. So we create these aliases to make reading the tests easier.
  var JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;

  var dateUtil;

  beforeEach(module('material.components.datepicker'));

  beforeEach(inject(function($$mdDateUtil) {
    dateUtil = $$mdDateUtil;
  }));

  it('should get the first day of a month', function() {
    var first = dateUtil.getFirstDateOfMonth(new Date(1985, OCT, 26));

    expect(first.getFullYear()).toBe(1985);
    expect(first.getMonth()).toBe(9);
    expect(first.getDate()).toBe(1);
  });

  it('should get the first day of the month from the first day of the month', function() {
    var first = dateUtil.getFirstDateOfMonth(new Date(1985, OCT, 1));

    expect(first.getFullYear()).toBe(1985);
    expect(first.getMonth()).toBe(9);
    expect(first.getDate()).toBe(1);
  });

  it('should get the number of days in a month', function() {
    // Month with 31 days.
    expect(dateUtil.getNumberOfDaysInMonth(new Date(2015, JAN, 1))).toBe(31);

    // Month with 30 days.
    expect(dateUtil.getNumberOfDaysInMonth(new Date(2015, APR, 1))).toBe(30);

    // Month with 28 days
    expect(dateUtil.getNumberOfDaysInMonth(new Date(2015, FEB, 1))).toBe(28);

    // Month with 29 days.
    expect(dateUtil.getNumberOfDaysInMonth(new Date(2012, FEB, 1))).toBe(29);
  });

  it('should get an arbitrary day in the next month', function() {
    // Next month in the same year.
    var next = dateUtil.getDateInNextMonth(new Date(2015, JAN, 1));
    expect(next.getMonth()).toBe(1);
    expect(next.getFullYear()).toBe(2015);

    // Next month in the following year.
    next = dateUtil.getDateInNextMonth(new Date(2015, DEC, 1));
    expect(next.getMonth()).toBe(0);
    expect(next.getFullYear()).toBe(2016);
  });

  it('should get an arbitrary day in the previous month', function() {
    // Previous month in the same year.
    var next = dateUtil.getDateInPreviousMonth(new Date(2015, JUL, 1));
    expect(next.getMonth()).toBe(5);
    expect(next.getFullYear()).toBe(2015);

    // Previous month in the past year.
    next = dateUtil.getDateInPreviousMonth(new Date(2015, JAN, 1));
    expect(next.getMonth()).toBe(11);
    expect(next.getFullYear()).toBe(2014);
  });

  it('should check whether two dates are in the same month and year', function() {
    // Same month and year.
    var first = new Date(2015, APR, 30);
    var second = new Date(2015, APR, 1);
    expect(dateUtil.isSameMonthAndYear(first, second)).toBe(true);

    // Same exact day.
    first = new Date(2015, APR, 1);
    second = new Date(2015, APR, 1);
    expect(dateUtil.isSameMonthAndYear(first, second)).toBe(true);

    // Same month, different year.
    first = new Date(2015, APR, 30);
    second = new Date(2005, APR, 1);
    expect(dateUtil.isSameMonthAndYear(first, second)).toBe(false);

    // Same year, different month.
    first = new Date(2015, APR, 30);
    second = new Date(2015, JUL, 1);
    expect(dateUtil.isSameMonthAndYear(first, second)).toBe(false);

    // Different month and year.
    first = new Date(2012, APR, 30);
    second = new Date(2015, JUL, 1);
    expect(dateUtil.isSameMonthAndYear(first, second)).toBe(false);
  });

  it('should check whether two dates are the same day', function() {
    // Same exact day and time.
    var first = new Date(2015, APR, 1);
    var second = new Date(2015, APR, 1);
    expect(dateUtil.isSameDay(first, second)).toBe(true);

    // Same day, different time.
    first = new Date(2015, APR, 30, 3);
    second = new Date(2015, APR, 30, 4);
    expect(dateUtil.isSameDay(first, second)).toBe(true);

    // Same month and year, different day.
    first = new Date(2015, APR, 30);
    second = new Date(2015, APR, 1);
    expect(dateUtil.isSameDay(first, second)).toBe(false);

    // Same month, different year.
    first = new Date(2015, APR, 30);
    second = new Date(2005, APR, 30);
    expect(dateUtil.isSameDay(first, second)).toBe(false);

    // Same year, different month.
    first = new Date(2015, APR, 30);
    second = new Date(2015, JUL, 30);
    expect(dateUtil.isSameDay(first, second)).toBe(false);

    // Different month and year.
    first = new Date(2012, APR, 30);
    second = new Date(2015, JUL, 30);
    expect(dateUtil.isSameDay(first, second)).toBe(false);
  });

  it('should check whether a date is in the next month', function() {
    // Next month within the same year.
    var first = new Date(2015, JUL, 15);
    var second = new Date(2015, AUG, 25);
    expect(dateUtil.isInNextMonth(first, second)).toBe(true);

    // Next month across years.
    first = new Date(2015, DEC, 15);
    second = new Date(2016, JAN, 25);
    expect(dateUtil.isInNextMonth(first, second)).toBe(true);

    // Not in the next month (past, same year).
    first = new Date(2015, JUN, 15);
    second = new Date(2015, APR, 25);
    expect(dateUtil.isInNextMonth(first, second)).toBe(false);

    // Not in the next month (future, same year).
    first = new Date(2015, JUN, 15);
    second = new Date(2015, AUG, 25);
    expect(dateUtil.isInNextMonth(first, second)).toBe(false);

    // Not in the next month (month + 1 in different year).
    first = new Date(2015, JUN, 15);
    second = new Date(2016, JUL, 25);
    expect(dateUtil.isInNextMonth(first, second)).toBe(false);
  });

  it('should check whether a date is in the previous month', function() {
    // Previous month within the same year.
    var first = new Date(2015, AUG, 15);
    var second = new Date(2015, JUL, 25);
    expect(dateUtil.isInPreviousMonth(first, second)).toBe(true);

    // Previous month across years.
    first = new Date(2015, JAN, 15);
    second = new Date(2014, DEC, 25);
    expect(dateUtil.isInPreviousMonth(first, second)).toBe(true);

    // Not in the previous month (past, same year).
    first = new Date(2015, JUN, 15);
    second = new Date(2015, APR, 25);
    expect(dateUtil.isInPreviousMonth(first, second)).toBe(false);

    // Not in the previous month (future, same year).
    first = new Date(2015, JUN, 15);
    second = new Date(2015, AUG, 25);
    expect(dateUtil.isInPreviousMonth(first, second)).toBe(false);

    // Not in the previous month (month - 1 in different year).
    first = new Date(2015, JUN, 15);
    second = new Date(2016, MAY, 25);
    expect(dateUtil.isInPreviousMonth(first, second)).toBe(false);
  });

  it('should get the midpoint between two dates', function() {
    var start = new Date(2010, MAR, 10);
    var end = new Date(2010, MAR, 20);
    var midpoint = dateUtil.getDateMidpoint(start, end);

    expect(midpoint.getTime()).toEqual(new Date(2010, MAR, 15).getTime());
  });

  it('should get the week of the month in which a given date appears', function() {
    // May 2015 spans 6 weeks.
    expect(dateUtil.getWeekOfMonth(new Date(2015, MAY, 1))).toBe(0);
    expect(dateUtil.getWeekOfMonth(new Date(2015, MAY, 8))).toBe(1);
    expect(dateUtil.getWeekOfMonth(new Date(2015, MAY, 15))).toBe(2);
    expect(dateUtil.getWeekOfMonth(new Date(2015, MAY, 22))).toBe(3);
    expect(dateUtil.getWeekOfMonth(new Date(2015, MAY, 29))).toBe(4);
    expect(dateUtil.getWeekOfMonth(new Date(2015, MAY, 31))).toBe(5);

    // Feb 2015 spans 4 weeks. Check both the first and last day of each week.
    expect(dateUtil.getWeekOfMonth(new Date(2015, FEB, 1))).toBe(0);
    expect(dateUtil.getWeekOfMonth(new Date(2015, FEB, 7))).toBe(0);
    expect(dateUtil.getWeekOfMonth(new Date(2015, FEB, 8))).toBe(1);
    expect(dateUtil.getWeekOfMonth(new Date(2015, FEB, 14))).toBe(1);
    expect(dateUtil.getWeekOfMonth(new Date(2015, FEB, 15))).toBe(2);
    expect(dateUtil.getWeekOfMonth(new Date(2015, FEB, 21))).toBe(2);
    expect(dateUtil.getWeekOfMonth(new Date(2015, FEB, 22))).toBe(3);
    expect(dateUtil.getWeekOfMonth(new Date(2015, FEB, 28))).toBe(3);
  });

  it('should increment a date by a number of days', function() {
    // Increment by one.
    var start = new Date(2015, MAY, 15);
    var end = new Date(2015, MAY, 16);
    expect(dateUtil.isSameDay(dateUtil.incrementDays(start, 1), end)).toBe(true);

    // Negative by negative one.
    start = new Date(2015, MAY, 15);
    end = new Date(2015, MAY, 14);
    expect(dateUtil.isSameDay(dateUtil.incrementDays(start, -1), end)).toBe(true);

    // Into next month.
    start = new Date(2015, MAY, 31);
    end = new Date(2015, JUN, 1);
    expect(dateUtil.isSameDay(dateUtil.incrementDays(start, 1), end)).toBe(true);

    // Into previous month.
    start = new Date(2015, MAY, 1);
    end = new Date(2015, APR, 30);
    expect(dateUtil.isSameDay(dateUtil.incrementDays(start, -1), end)).toBe(true);

    // Into next year.
    start = new Date(2015, DEC, 31);
    end = new Date(2016, JAN, 1);
    expect(dateUtil.isSameDay(dateUtil.incrementDays(start, 1), end)).toBe(true);

    // Into last year.
    start = new Date(2015, JAN, 1);
    end = new Date(2014, DEC, 31);
    expect(dateUtil.isSameDay(dateUtil.incrementDays(start, -1), end)).toBe(true);
  });

  it('should increment a date by a number of months', function() {
    // Increment by one.
    var start = new Date(2015, MAY, 15);
    var end = new Date(2015, JUN, 15);
    expect(dateUtil.isSameDay(dateUtil.incrementMonths(start, 1), end)).toBe(true);

    // Negative by negative one.
    start = new Date(2015, MAY, 15);
    end = new Date(2015, APR, 15);
    expect(dateUtil.isSameDay(dateUtil.incrementMonths(start, -1), end)).toBe(true);

    // Next month has fewer days.
    start = new Date(2015, JAN, 30);
    end = new Date(2015, FEB, 28);
    expect(dateUtil.isSameDay(dateUtil.incrementMonths(start, 1), end)).toBe(true);

    // Previous month has fewer days.
    start = new Date(2015, MAY, 31);
    end = new Date(2015, APR, 30);
    expect(dateUtil.isSameDay(dateUtil.incrementMonths(start, -1), end)).toBe(true);
  });

  it('should get the last date of a month', function() {
    // Normal February
    var date = new Date(2015, FEB, 1);
    var lastOfMonth = new Date(2015, FEB, 28);
    expect(dateUtil.isSameDay(dateUtil.getLastDateOfMonth(date), lastOfMonth)).toBe(true);

    // Leap year February
    date = new Date(2012, FEB, 1);
    lastOfMonth = new Date(2012, FEB, 29);
    expect(dateUtil.isSameDay(dateUtil.getLastDateOfMonth(date), lastOfMonth)).toBe(true);

    // Month with 31 days.
    date = new Date(2015, DEC, 12);
    lastOfMonth = new Date(2015, DEC, 31);
    expect(dateUtil.isSameDay(dateUtil.getLastDateOfMonth(date), lastOfMonth)).toBe(true);

    // Month with 30 days.
    date = new Date(2015, APR, 3);
    lastOfMonth = new Date(2015, APR, 30);
    expect(dateUtil.isSameDay(dateUtil.getLastDateOfMonth(date), lastOfMonth)).toBe(true);
  });

  it('should create a date at midnight today', function() {
    var today = new Date();
    var todayAtMidnight = dateUtil.createDateAtMidnight();
    expect(dateUtil.isSameDay(todayAtMidnight, today)).toBe(true);
    expect(todayAtMidnight.getHours()).toBe(0);
    expect(todayAtMidnight.getMinutes()).toBe(0);
    expect(todayAtMidnight.getSeconds()).toBe(0);
    expect(todayAtMidnight.getMilliseconds()).toBe(0);
  });

  it('should create a date at midnight the day of a timestamp', function() {
    var day = new Date(2015, JUN, 1, 12, 30);
    var dayAtMidnight = dateUtil.createDateAtMidnight(day.getTime());
    expect(dateUtil.isSameDay(dayAtMidnight, day)).toBe(true);
    expect(dayAtMidnight.getHours()).toBe(0);
    expect(dayAtMidnight.getMinutes()).toBe(0);
    expect(dayAtMidnight.getSeconds()).toBe(0);
    expect(dayAtMidnight.getMilliseconds()).toBe(0);
  });

  it('should not error when trying to set an invalid date to midnight', function() {
    dateUtil.setDateTimeToMidnight(new Date(NaN));
    dateUtil.setDateTimeToMidnight(null);
    dateUtil.setDateTimeToMidnight(undefined);
  });

  it('should determine whether dates are valid', function() {
    expect(dateUtil.isValidDate(null)).toBeFalsy();
    expect(dateUtil.isValidDate(undefined)).toBeFalsy();
    expect(dateUtil.isValidDate('')).toBeFalsy();
    expect(dateUtil.isValidDate(0)).toBeFalsy();
    expect(dateUtil.isValidDate(NaN)).toBeFalsy();
    expect(dateUtil.isValidDate(123456789)).toBeFalsy();
    expect(dateUtil.isValidDate('123456789')).toBeFalsy();
    expect(dateUtil.isValidDate(new Date(''))).toBeFalsy();
    expect(dateUtil.isValidDate(new Date('Banjo'))).toBeFalsy();
    expect(dateUtil.isValidDate(new Date(NaN))).toBeFalsy();

    expect(dateUtil.isValidDate(new Date())).toBe(true);
  });
});
