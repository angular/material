
describe('$$mdDateUtil', function() {
  var dateUtil;

  beforeEach(module('material.components.calendar'));

  beforeEach(inject(function($$mdDateUtil) {
    dateUtil = $$mdDateUtil;
  }));

  it('should get the first day of a month', function() {
    var first = dateUtil.getFirstDateOfMonth(new Date(1985, 9, 26));

    expect(first.getFullYear()).toBe(1985);
    expect(first.getMonth()).toBe(9);
    expect(first.getDate()).toBe(1);
  });

  it('should get the first day of the month from the first day of the month', function() {
    var first = dateUtil.getFirstDateOfMonth(new Date(1985, 9, 1));

    expect(first.getFullYear()).toBe(1985);
    expect(first.getMonth()).toBe(9);
    expect(first.getDate()).toBe(1);
  });

  it('should get the number of days in a month', function() {
    // Month with 31 days.
    expect(dateUtil.getNumberOfDaysInMonth(new Date(2015, 0, 1))).toBe(31);

    // Month with 30 days.
    expect(dateUtil.getNumberOfDaysInMonth(new Date(2015, 3, 1))).toBe(30);

    // Month with 28 days
    expect(dateUtil.getNumberOfDaysInMonth(new Date(2015, 1, 1))).toBe(28);

    // Month with 29 days.
    expect(dateUtil.getNumberOfDaysInMonth(new Date(2012, 1, 1))).toBe(29);
  });

  it('should get an arbitrary day in the next month', function() {
    // Next month in the same year.
    var next = dateUtil.getDateInNextMonth(new Date(2015, 0, 1));
    expect(next.getMonth()).toBe(1);
    expect(next.getFullYear()).toBe(2015);

    // Next month in the following year.
    next = dateUtil.getDateInNextMonth(new Date(2015, 11, 1));
    expect(next.getMonth()).toBe(0);
    expect(next.getFullYear()).toBe(2016);
  });

  it('should get an arbitrary day in the previous month', function() {
    // Previous month in the same year.
    var next = dateUtil.getDateInPreviousMonth(new Date(2015, 6, 1));
    expect(next.getMonth()).toBe(5);
    expect(next.getFullYear()).toBe(2015);

    // Previous month in the past year.
    next = dateUtil.getDateInPreviousMonth(new Date(2015, 0, 1));
    expect(next.getMonth()).toBe(11);
    expect(next.getFullYear()).toBe(2014);
  });

  it('should check whether two dates are in the same month and year', function() {
    // Same month and year.
    var first = new Date(2015, 3, 30);
    var second = new Date(2015, 3, 1);
    expect(dateUtil.isSameMonthAndYear(first, second)).toBe(true);

    // Same exact day.
    first = new Date(2015, 3, 1);
    second = new Date(2015, 3, 1);
    expect(dateUtil.isSameMonthAndYear(first, second)).toBe(true);

    // Same month, different year.
    first = new Date(2015, 3, 30);
    second = new Date(2005, 3, 1);
    expect(dateUtil.isSameMonthAndYear(first, second)).toBe(false);

    // Same year, different month.
    first = new Date(2015, 3, 30);
    second = new Date(2015, 6, 1);
    expect(dateUtil.isSameMonthAndYear(first, second)).toBe(false);

    // Different month and year.
    first = new Date(2012, 3, 30);
    second = new Date(2015, 6, 1);
    expect(dateUtil.isSameMonthAndYear(first, second)).toBe(false);
  });

  it('should check whether two dates are the same day', function() {
    // Same exact day and time.
    var first = new Date(2015, 3, 1);
    var second = new Date(2015, 3, 1);
    expect(dateUtil.isSameDay(first, second)).toBe(true);

    // Same day, different time.
    first = new Date(2015, 3, 30, 3);
    second = new Date(2015, 3, 30, 4);
    expect(dateUtil.isSameDay(first, second)).toBe(true);

    // Same month and year, different day.
    first = new Date(2015, 3, 30);
    second = new Date(2015, 3, 1);
    expect(dateUtil.isSameDay(first, second)).toBe(false);

    // Same month, different year.
    first = new Date(2015, 3, 30);
    second = new Date(2005, 3, 30);
    expect(dateUtil.isSameDay(first, second)).toBe(false);

    // Same year, different month.
    first = new Date(2015, 3, 30);
    second = new Date(2015, 6, 30);
    expect(dateUtil.isSameDay(first, second)).toBe(false);

    // Different month and year.
    first = new Date(2012, 3, 30);
    second = new Date(2015, 6, 30);
    expect(dateUtil.isSameDay(first, second)).toBe(false);
  });

  it('should check whether a date is in the next month', function() {
    // Next month within the same year.
    var first = new Date(2015, 6, 15);
    var second = new Date(2015, 7, 25);
    expect(dateUtil.isInNextMonth(first, second)).toBe(true);

    // Next month across years.
    first = new Date(2015, 11, 15);
    second = new Date(2016, 0, 25);
    expect(dateUtil.isInNextMonth(first, second)).toBe(true);

    // Not in the next month (past, same year).
    first = new Date(2015, 5, 15);
    second = new Date(2015, 3, 25);
    expect(dateUtil.isInNextMonth(first, second)).toBe(false);

    // Not in the next month (future, same year).
    first = new Date(2015, 5, 15);
    second = new Date(2015, 7, 25);
    expect(dateUtil.isInNextMonth(first, second)).toBe(false);

    // Not in the next month (month + 1 in different year).
    first = new Date(2015, 5, 15);
    second = new Date(2016, 6, 25);
    expect(dateUtil.isInNextMonth(first, second)).toBe(false);
  });

  it('should check whether a date is in the previous month', function() {
    // Previous month within the same year.
    var first = new Date(2015, 7, 15);
    var second = new Date(2015, 6, 25);
    expect(dateUtil.isInPreviousMonth(first, second)).toBe(true);

    // Previous month across years.
    first = new Date(2015, 0, 15);
    second = new Date(2014, 11, 25);
    expect(dateUtil.isInPreviousMonth(first, second)).toBe(true);

    // Not in the previous month (past, same year).
    first = new Date(2015, 5, 15);
    second = new Date(2015, 3, 25);
    expect(dateUtil.isInPreviousMonth(first, second)).toBe(false);

    // Not in the previous month (future, same year).
    first = new Date(2015, 5, 15);
    second = new Date(2015, 7, 25);
    expect(dateUtil.isInPreviousMonth(first, second)).toBe(false);

    // Not in the previous month (month - 1 in different year).
    first = new Date(2015, 5, 15);
    second = new Date(2016, 4, 25);
    expect(dateUtil.isInPreviousMonth(first, second)).toBe(false);
  });

  it('should get the midpoint between two dates', function() {
    var start = new Date(2010, 2, 10);
    var end = new Date(2010, 2, 20);
    var midpoint = dateUtil.getDateMidpoint(start, end);

    expect(dateUtil.isSameDay(midpoint, new Date(2010, 2, 15))).toBe(true);
  });

  it('should get the week of the month in which a given date appears', function() {
  });

  it('should increment a date by a number of days', function() {
  });

  it('should increment a date by a number of months', function() {
  });

  it('should get the last date of a month', function() {
  });
});
