describe('<md-switch>', function() {
  var CHECKED_CSS = 'md-checked';
  var $compile, parentScope;

  beforeEach(module('ngAria', 'material.components.switch'));

  beforeEach(inject(function($injector) {
    var $rootScope = $injector.get('$rootScope');
    parentScope = $rootScope.$new();

    $compile = $injector.get('$compile');
  }));

  it('should set checked css class and aria-checked attributes', function() {
    var template =
        '<div>' +
          '<md-switch ng-model="blue"></md-switch>' +
          '<md-switch ng-model="green"></md-switch>' +
        '</div>';

    var element = $compile(template)(parentScope);

    parentScope.$apply(function(){
      parentScope.blue = false;
      parentScope.green = true;
    });

    var switches = angular.element(element[0].querySelectorAll('md-switch'));

    expect(switches.eq(0).hasClass(CHECKED_CSS)).toEqual(false);
    expect(switches.eq(0).attr('aria-checked')).toEqual('false');
    expect(switches.eq(0).attr('role')).toEqual('checkbox');

    expect(switches.eq(1).hasClass(CHECKED_CSS)).toEqual(true);
    expect(switches.eq(1).attr('aria-checked')).toEqual('true');
    expect(switches.eq(1).attr('role')).toEqual('checkbox');

    parentScope.$apply(function(){
      parentScope.blue = true;
      parentScope.green = false;
    });

    expect(switches.eq(1).hasClass(CHECKED_CSS)).toEqual(false);
    expect(switches.eq(0).hasClass(CHECKED_CSS)).toEqual(true);
    expect(switches.eq(1).attr('aria-checked')).toEqual('false');
    expect(switches.eq(0).attr('aria-checked')).toEqual('true');
    expect(switches.eq(1).attr('role')).toEqual('checkbox');
  });

  it('should have tabindex -1 while disabled', function() {
    parentScope.value = false;
    var el = $compile('<md-switch ng-disabled="value">')(parentScope);

    parentScope.$apply();
    expect(el.attr('tabindex')).not.toEqual('-1');

    parentScope.$apply('value = true');
    expect(el.attr('tabindex')).toEqual('-1');
  });

  it('should disable via `disabled` attribute', function() {
    parentScope.value = false;
    var element = $compile('<md-switch disabled>')(parentScope);

    parentScope.$apply();
    expect(element.attr('tabindex')).toEqual('-1');
  });
});
