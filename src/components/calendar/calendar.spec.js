
describe('md-checkbox', function() {
  var ngElement, element, scope, pageScope, controller, $animate;

  /**
   * To apply a change in the date, a scope $apply() AND a manual triggering of animation
   * callbacks is necessary.
   */
  function applyDateChange() {
    pageScope.$apply();
    $animate.triggerCallbacks();
  }

  beforeEach(module('material.components.calendar', 'ngAnimateMock'));

  beforeEach(inject(function($compile, $rootScope, _$animate_) {
    $animate = _$animate_;

    var template = '<md-calendar ng-model="myDate"></md-calendar>';
    pageScope = $rootScope.$new();
    pageScope.myDate = null;

    ngElement = $compile(template)(pageScope);
    element = ngElement[0];
    scope = ngElement.scope();
    controller = ngElement.controller('mdCalendar');

    pageScope.$apply();
  }));

  describe('ngModel binding', function() {

    it('should update the calendar based on ngModel change', function() {
      pageScope.myDate = new Date(2014, 4, 30);
      applyDateChange();

      var displayedMonth = element.querySelector('.md-calendar-month-label');
      var selectedDate = element.querySelector('.md-calendar-selected-date');

      expect(displayedMonth.textContent).toBe('May');
      expect(selectedDate.textContent).toBe('30')
    });

  });

  describe('calendar construction', function() {

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
