describe('$mdElidable', function() {
  var STYLE = {
    'font-family': 'monospace',
    'font-size': '14px',
    'line-height': '20px',
    'max-height': '40px'
  };

  beforeEach(module('material.components.elidable'));

  describe('LTR text', function () {
    var scope, element, text;
    var template =
      '<div md-elidable>' +
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Morbi cursus ex et quam congue lobortis.' +
      '</div>';

    beforeEach(inject(function ($compile, $rootScope) {
      scope = $rootScope.$new();
      element = $compile(template)(scope);
      text = element.text();
      angular.element(document.body).append(element);
      element.css(STYLE);
    }));

    afterEach(function () {
      scope.$destroy();
      element.remove();
    });

    it('should apply the CSS styles on which it depends', function () {
      expect(element.css('display')).toBe('block');
      expect(element.css('overflow')).toBe('hidden');
      expect(element.css('white-space')).toBe('normal');
    });

    it('should truncate its text content', inject(function ($mdElidable) {
      element.css('width', '320px');
      $mdElidable.elide();

      var actual = element.text();
      expect(actual.length).toBeLessThan(text.length);
      expect(text.indexOf(actual.slice(0, -1))).toBe(0);
    }));

    it("should produce truncated text that ends with an ellipsis ('…')",
    inject(function ($mdElidable) {
      element.css('width', '320px');
      $mdElidable.elide();

      expect(element.text().slice(-1)).toBe('…');
    }));
  });

  describe('LTR elements', function () {
    var scope, element, text;
    var template =
      '<div md-elidable>' +
        'Lorem ipsum <span style="font-weight:600">dolor sit amet</span>, ' +
        'consectetur adipiscing elit.' +
        '<span style="font-weight:600">Morbi cursus ex</span> et quam congue ' +
        '<span style="font-weight:600">lobortis</span>.'
      '</div>';

    beforeEach(inject(function ($compile, $rootScope) {
      scope = $rootScope.$new();
      element = $compile(template)(scope);
      text = element.text();
      angular.element(document.body).append(element);
      element.css(STYLE);
    }));

    afterEach(function () {
      scope.$destroy();
      element.remove();
    });

    it('should truncate its text content', inject(function ($mdElidable) {
      element.css('width', '320px');
      $mdElidable.elide();

      var actual = element.text();
      expect(actual.length).toBeLessThan(text.length);
      expect(text.indexOf(actual.slice(0, -1))).toBe(0);
    }));

    it("should produce truncated text that ends with an ellipsis ('…')",
    inject(function ($mdElidable) {
      element.css('width', '320px');
      $mdElidable.elide();

      expect(element.text().slice(-1)).toBe('…');
    }));

    it('should preserve its visible nested elements, but not invisible ones', inject(function ($mdElidable) {
      element.css('width', '320px');
      $mdElidable.elide();

      var actual = angular.element(element[0].firstChild).find('span');
      var nx = actual.length;
      expect(nx).toBe(2);
      for (var x = 0; x < nx; ++x) {
        var el = angular.element(actual[x]);
        expect(el.css('font-weight')).toBe('600');
      }
    }));
  });

  describe('RTL text', function () {
    var scope, element, text;
    var template =
      '<div md-elidable>' +
'אם יש משהו משותף לבני הזוג אנדרווד ונתניהו הוא חוסר המוכנות שלהם להוריד את ראשם בכנעה מול בוז ציבורי' +
      '</div>';

    beforeEach(inject(function ($compile, $rootScope) {
      scope = $rootScope.$new();
      element = $compile(template)(scope);
      text = element.text();
      angular.element(document.body).append(element);
      element.css(STYLE);
    }));

    afterEach(function () {
      scope.$destroy();
      element.remove();
    });

    it('should truncate its text content from left to right.', inject(function ($mdElidable) {
      element.css('width', '320px');
      $mdElidable.elide();

      var actual = element.text();
      expect(actual.length).toBeLessThan(text.length);
      expect(text.indexOf(actual.slice(0, -1))).toBe(0);
      expect(actual.slice(0, 2)).toBe(text.slice(0, 2));
      expect(text.slice(actual.length - 3, 2)).toBe(actual.slice(-3, 2));
    }));

    it("should produce truncated text that ends with an ellipsis ('…') on the left",
    inject(function ($mdElidable) {
      element.css('width', '320px');
      $mdElidable.elide();

      expect(element.text().slice(-1)).toBe('…');
    }));
  });
});
