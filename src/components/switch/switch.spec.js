describe('<md-switch>', function() {
  var CHECKED_CSS = 'md-checked';

  beforeEach(module('ngAria', 'material.components.switch'));

  it('should set checked css class and aria-checked attributes', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
                             '<md-switch ng-model="blue">' +
                             '</md-switch>' +
                             '<md-switch ng-model="green">' +
                             '</md-switch>' +
                           '</div>')($rootScope);

    $rootScope.$apply(function(){
      $rootScope.blue = false;
      $rootScope.green = true;
    });

    var switches = angular.element(element[0].querySelectorAll('md-switch'));

    expect(switches.eq(0).hasClass(CHECKED_CSS)).toEqual(false);
    expect(switches.eq(1).hasClass(CHECKED_CSS)).toEqual(true);
    expect(switches.eq(0).attr('aria-checked')).toEqual('false');
    expect(switches.eq(1).attr('aria-checked')).toEqual('true');
    expect(switches.eq(0).attr('role')).toEqual('checkbox');

    $rootScope.$apply(function(){
      $rootScope.blue = true;
      $rootScope.green = false;
    });

    expect(switches.eq(1).hasClass(CHECKED_CSS)).toEqual(false);
    expect(switches.eq(0).hasClass(CHECKED_CSS)).toEqual(true);
    expect(switches.eq(1).attr('aria-checked')).toEqual('false');
    expect(switches.eq(0).attr('aria-checked')).toEqual('true');
    expect(switches.eq(1).attr('role')).toEqual('checkbox');
  }));

  it('should have tabindex -1 while disabled', inject(function($rootScope, $compile) {
    $rootScope.value = false;
    var el = $compile('<md-switch ng-disabled="$root.value">')($rootScope);

    $rootScope.$apply();
    expect(el.attr('tabindex')).not.toEqual('-1');

    $rootScope.$apply('value = true');
    expect(el.attr('tabindex')).toEqual('-1');
  }));

});
