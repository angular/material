describe('<md-switch>', function() {
  var CHECKED_CSS = 'md-checked';

  beforeEach(TestUtil.mockRaf);
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

  it('should change on panstart/panend if no movement happened', inject(function($compile, $rootScope) {
    var element = $compile('<md-switch ng-model="banana"></md-switch>')($rootScope);
    var switchContainer = angular.element(element[0].querySelector('.md-container'));

    $rootScope.$apply('banana = false');

    expect($rootScope.banana).toBe(false);
    expect(element.hasClass(CHECKED_CSS)).toBe(false);

    switchContainer.triggerHandler('$md.dragstart', {});
    switchContainer.triggerHandler('$md.dragend', {distance: 1});

    expect($rootScope.banana).toBe(true);
    expect(element.hasClass(CHECKED_CSS)).toBe(true);

    switchContainer.triggerHandler('$md.dragstart', {});
    switchContainer.triggerHandler('$md.dragend', {distance: 5});

    expect($rootScope.banana).toBe(true);
    expect(element.hasClass(CHECKED_CSS)).toBe(true);

    switchContainer.triggerHandler('$md.dragstart', {});
    switchContainer.triggerHandler('$md.dragend', {distance: -1});

    expect($rootScope.banana).toBe(false);
    expect(element.hasClass(CHECKED_CSS)).toBe(false);
  }));

  it('should check on panend if translate > 50%', inject(function($compile, $rootScope) {
    var element = $compile('<md-switch ng-model="banana"></md-switch>')($rootScope);
    var switchContainer = angular.element(element[0].querySelector('.md-container'));
    var drag;

    drag = { distance: -55 };
    switchContainer.triggerHandler('$md.dragstart', {});
    drag.width = 100;
    switchContainer.triggerHandler('$md.drag', drag);
    switchContainer.triggerHandler('$md.dragend', drag);

    expect($rootScope.banana).toBe(true);
    expect(element.hasClass(CHECKED_CSS)).toBe(true);

    drag = { distance: 45 };
    switchContainer.triggerHandler('$md.dragstart', {});
    drag.width = 100;
    switchContainer.triggerHandler('$md.drag', drag);
    switchContainer.triggerHandler('$md.dragend', drag);

    expect($rootScope.banana).toBe(true);
    expect(element.hasClass(CHECKED_CSS)).toBe(true);

    drag = { distance: 85 };
    switchContainer.triggerHandler('$md.dragstart', {});
    drag.width = 100;
    switchContainer.triggerHandler('$md.drag', drag);
    switchContainer.triggerHandler('$md.dragend', drag);

    expect($rootScope.banana).toBe(false);
    expect(element.hasClass(CHECKED_CSS)).toBe(false);
  }));

});
