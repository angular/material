describe('materialInputGroup directive', function() {
  beforeEach(module('material.components.form'));

  function setup(attrs) {
    var el;
    inject(function($compile, $rootScope) {
      el = $compile('<div class="material-input-group material-input-group-theme-light-blue">' +
              '<label for="ftitle">Title</label>' +
              '<input id="ftitle" type="text" ng-model="data.title">' +
            '</div>')($rootScope.$new());
      $rootScope.$apply();
    });
    return el;
  }
  it('should set classes', function() {
    var el = setup('');
    var input = angular.element(el[0].querySelector('input'));
    input.triggerHandler('focus');
    expect(el.hasClass('material-input-focused')).toBe(true);
    input.val('cat');
    input.triggerHandler('change');
    expect(el.hasClass('material-input-has-value')).toBe(true);
    input.triggerHandler('blur');
    expect(el.hasClass('material-input-has-value')).toBe(true);
  });
});
