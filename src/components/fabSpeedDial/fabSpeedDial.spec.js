describe('<md-fab-speed-dial> directive', function() {

  beforeEach(module('material.components.fabSpeedDial'));

  var pageScope, element, controller;

  function compileAndLink(template) {
    inject(function($compile, $rootScope) {
      pageScope = $rootScope.$new();
      element = $compile(template)(pageScope);
      controller = element.controller('mdFabSpeedDial');

      pageScope.$apply();
    });
  }

  it('applies a class for each direction', inject(function() {
    compileAndLink(
      '<md-fab-speed-dial md-direction="{{direction}}"></md-fab-speed-dial>'
    );

    pageScope.$apply('direction = "down"');
    expect(element.hasClass('md-down')).toBe(true);

    pageScope.$apply('direction = "up"');
    expect(element.hasClass('md-up')).toBe(true);

    pageScope.$apply('direction = "left"');
    expect(element.hasClass('md-left')).toBe(true);

    pageScope.$apply('direction = "right"');
    expect(element.hasClass('md-right')).toBe(true);
  }));

  it('opens when the trigger element is focused', inject(function() {
    compileAndLink(
      '<md-fab-speed-dial><md-fab-trigger><button></button></md-fab-trigger></md-fab-speed-dial>'
    );

    element.find('button').triggerHandler('focus');
    pageScope.$digest();
    expect(controller.isOpen).toBe(true);
  }));

  it('opens when the speed dial elements are focused', inject(function() {
    compileAndLink(
      '<md-fab-speed-dial><md-fab-actions><button></button></md-fab-actions></md-fab-speed-dial>'
    );

    element.find('button').triggerHandler('focus');
    pageScope.$digest();
    expect(controller.isOpen).toBe(true);
  }));

  it('closes when the speed dial elements are blurred', inject(function() {
    compileAndLink(
      '<md-fab-speed-dial><md-fab-actions><button></button></md-fab-actions></md-fab-speed-dial>'
    );

    element.find('button').triggerHandler('focus');
    pageScope.$digest();
    expect(controller.isOpen).toBe(true);

    element.find('button').triggerHandler('blur');
    pageScope.$digest();
    expect(controller.isOpen).toBe(false);
  }));

  it('allows programmatic opening through the md-open attribute', inject(function() {
    compileAndLink(
      '<md-fab-speed-dial md-open="isOpen"></md-fab-speed-dial>'
    );

    // By default, it should be closed
    expect(controller.isOpen).toBe(false);

    // When md-open is true, it should be open
    pageScope.$apply('isOpen = true');
    expect(controller.isOpen).toBe(true);

    // When md-open is false, it should be closed
    pageScope.$apply('isOpen = false');
    expect(controller.isOpen).toBe(false);
  }));

});
