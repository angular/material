xdescribe('mdInputGroup directive', function() {
  beforeEach(module('material.components.textField'));

  function setup(inputAttrs) {
    var el;
    inject(function($compile, $rootScope) {
      el = $compile('<div class="md-input-group md-input-group-theme-light-blue">' +
              '<label for="ftitle">Title</label>' +
              '<md-input id="ftitle" type="text" '+(inputAttrs||'')+'>' +
            '</div>')($rootScope.$new());
      $rootScope.$apply();
    });
    return el;
  }
  it('should set input class for focus & blur', function() {
    var el = setup();
    var input = el.find('input');
    input.triggerHandler('focus');
    expect(el.hasClass('md-input-focused')).toBe(true);
    input.triggerHandler('blur');
    expect(el.hasClass('md-input-focused')).toBe(false);
  });

  it('should set input class for input event', function() {
    var el = setup();
    var input = el.find('input');
    input.val('cat');
    input.triggerHandler('input');
    expect(el.hasClass('md-input-has-value')).toBe(true);
    input.val('');
    input.triggerHandler('input');
    expect(el.hasClass('md-input-has-value')).toBe(false);
  });

  it('should set input class for ngModel render', function() {
    var el = setup('ng-model="something"');
    var input = el.find('input');
    expect(el.hasClass('md-input-has-value')).toBe(false);
    input.scope().$apply('something = "123"');
    expect(el.hasClass('md-input-has-value')).toBe(true);
    input.scope().$apply('something = ""');
    expect(el.hasClass('md-input-has-value')).toBe(false);
  });
});
