
describe('$$mdDateLocale', function() {
  var dateLocale, dateUtil;

  // Fake $locale with made-up days and months.
  var $localeFake = {
    DATETIME_FORMATS: {
      DAY: ['Sundog', 'Mondog', 'Tuesdog', 'Wednesdog', 'Thursdog', 'Fridog', 'Saturdog'],
      MONTH: ['JanZ', 'FebZ', 'MarZ', 'AprZ', 'MayZ', 'JunZ', 'JulZ', 'AugZ', 'SeptZ',
          'OctZ', 'NovZ', 'DecZ'],
      SHORTMONTH: ['JZ', 'FZ', 'MZ', 'AZ', 'MZ', 'JZ', 'JZ', 'AZ', 'SZ', 'OZ', 'NZ', 'DZ']
    }
  };

  beforeEach(module('material.components.calendar'));

  describe('with default values', function() {
    beforeEach(module(function($provide) {
      $provide.value('$locale', $localeFake);
    }));

    beforeEach(inject(function($$mdDateLocale, $$mdDateUtil) {
      dateLocale = $$mdDateLocale;
      dateUtil = $$mdDateUtil;
    }));

    it('should expose default days, months, and dates', function() {
      expect(dateLocale.months).toEqual($localeFake.DATETIME_FORMATS.MONTH);
      expect(dateLocale.shortMonths).toEqual($localeFake.DATETIME_FORMATS.SHORTMONTH);
      expect(dateLocale.days).toEqual($localeFake.DATETIME_FORMATS.DAY);
      expect(dateLocale.shortDays).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
      expect(dateLocale.dates).toEqual([undefined, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
          15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
    });

    it('should have a default date formatter', function() {
      var date = new Date(2014, 2, 25);
      var dateStr = dateLocale.formatDate(date);
      expect(dateStr).toEqual(jasmine.any(String));
      expect(dateStr).toBeTruthy();
    });

    it('should have a default date parser', function() {
      var dateStr = '2014-03-25';
      expect(dateLocale.parseDate(dateStr)).toEqual(jasmine.any(Date));
    });
  });

  describe('with custom values', function() {
    var fakeMonths = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    var fakeshortMonths = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'j', 'l'];
    var fakeDays = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
    var fakeShortDays = ['1', '2', '3', '4', '5', '6', '7'];
    var fakeDates = [undefined, 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9', 'X10', 'X11',
        'X12', 'X13', 'X14', 'X15', 'X16', 'X17', 'X18', 'X19', 'X20', 'X21', 'X22', 'X23', 'X24',
        'X25', 'X26', 'X27', 'X28', 'X29', 'X30', 'X31'];

    beforeEach(module(function($$mdDateLocaleProvider) {
      $$mdDateLocaleProvider.months = fakeMonths;
      $$mdDateLocaleProvider.shortMonths = fakeshortMonths;
      $$mdDateLocaleProvider.days = fakeDays;
      $$mdDateLocaleProvider.shortDays = fakeShortDays;
      $$mdDateLocaleProvider.dates = fakeDates;
      $$mdDateLocaleProvider.formatDate = function() {
        return 'Your birthday!'
      };
      $$mdDateLocaleProvider.parseDate = function() {
        return new Date(1969, 6, 16);
      };
    }));


    beforeEach(inject(function($$mdDateLocale, $$mdDateUtil) {
      dateLocale = $$mdDateLocale;
      dateUtil = $$mdDateUtil;
    }));

    it('should expose custom settings', function() {
      expect(dateLocale.months).toEqual(fakeMonths);
      expect(dateLocale.shortMonths).toEqual(fakeshortMonths);
      expect(dateLocale.days).toEqual(fakeDays);
      expect(dateLocale.shortDays).toEqual(fakeShortDays);
      expect(dateLocale.dates).toEqual(fakeDates);
      expect(dateLocale.formatDate(new Date())).toEqual('Your birthday!');
      expect(dateLocale.parseDate('2020-01-20')).toEqual(new Date(1969, 6, 16));
    });
  });
});
