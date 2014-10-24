describe('materialInputGroup directive', function() {
  beforeEach(module('material.components.form'));

  function setup(inputAttrs) {
    var el;
    inject(function($compile, $rootScope) {
      el = $compile('<div class="material-input-group material-input-group-theme-light-blue">' +
              '<label for="ftitle">Title</label>' +
              '<material-input id="ftitle" type="text" '+(inputAttrs||'')+'>' +
            '</div>')($rootScope.$new());
      $rootScope.$apply();
    });
    return el;
  }
  it('should set input class for focus & blur', function() {
    var el = setup();
    var input = el.find('input');
    input.triggerHandler('focus');
    expect(el.hasClass('material-input-focused')).toBe(true);
    input.triggerHandler('blur');
    expect(el.hasClass('material-input-focused')).toBe(false);
  });

  it('should set input class for input event', function() {
    var el = setup();
    var input = el.find('input');
    input.val('cat');
    input.triggerHandler('input');
    expect(el.hasClass('material-input-has-value')).toBe(true);
    input.val('');
    input.triggerHandler('input');
    expect(el.hasClass('material-input-has-value')).toBe(false);
  });

  it('should set input class for ngModel render', function() {
    var el = setup('ng-model="something"');
    var input = el.find('input');
    expect(el.hasClass('material-input-has-value')).toBe(false);
    input.scope().$apply('something = "123"');
    expect(el.hasClass('material-input-has-value')).toBe(true);
    input.scope().$apply('something = ""');
    expect(el.hasClass('material-input-has-value')).toBe(false);
  });

  it('should set the disable the input when material-input-group is disabled', function() {
    var el = setup();
    var input = el.find('input');
    expect(input.attr('disabled')).toBe(undefined);
    el.attr('disabled', '');
    input.scope().$digest();
    expect(input.attr('disabled')).not.toBe(undefined);
    el.removeAttr('disabled');
    input.scope().$digest();
    expect(input.attr('disabled')).toBe(undefined);
  });
});
