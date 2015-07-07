describe('<md-fab-speed-dial> directive', function () {

  var pageScope, element, controller;
  var $rootScope, $animate, $timeout;

  beforeEach(module('material.components.fabSpeedDial'));
  beforeEach(inject(function (_$rootScope_, _$animate_, _$timeout_) {
    $rootScope = _$rootScope_;
    $animate = _$animate_;
    $timeout = _$timeout_;
  }));

  it('applies a class for each direction', inject(function () {
    build(
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

  it('opens when the trigger element is focused', inject(function () {
    build(
      '<md-fab-speed-dial><md-fab-trigger><button></button></md-fab-trigger></md-fab-speed-dial>'
    );

    element.find('button').triggerHandler('focus');
    pageScope.$digest();
    expect(controller.isOpen).toBe(true);
  }));

  it('opens when the speed dial elements are focused', inject(function () {
    build(
      '<md-fab-speed-dial><md-fab-actions><button></button></md-fab-actions></md-fab-speed-dial>'
    );

    element.find('button').triggerHandler('focus');
    pageScope.$digest();

    expect(controller.isOpen).toBe(true);
  }));

  it('closes when the speed dial elements are blurred', inject(function () {
    build(
      '<md-fab-speed-dial>'+
      ' <md-fab-trigger>' +
      '   <button>Show Actions</button>' +
      ' </md-fab-trigger>' +
      ' </md-fab-actions>' +
      ' <md-fab-actions>' +
      '   <button>Action 1</button>' +
      ' </md-fab-actions>' +
      '</md-fab-speed-dial>'
    );

    element.find('button').triggerHandler('focus');
    pageScope.$digest();

    expect(controller.isOpen).toBe(true);

    var actionBtn = element.find('md-fab-actions').find('button');
    actionBtn.triggerHandler('focus');
    pageScope.$digest();
    actionBtn.triggerHandler('blur');
    pageScope.$digest();

    expect(controller.isOpen).toBe(false);
  }));

  it('allows programmatic opening through the md-open attribute', inject(function () {
    build(
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

  it('properly finishes the fling animation', inject(function (mdFabSpeedDialFlingAnimation) {
    build(
      '<md-fab-speed-dial md-open="isOpen" class="md-fling">' +
      '  <md-fab-trigger><button></button></md-fab-trigger>' +
      '  <md-fab-actions><button></button></md-fab-actions>' +
      '</md-fab-speed-dial>'
    );

    var addDone = jasmine.createSpy('addDone');
    var removeDone = jasmine.createSpy('removeDone');

    mdFabSpeedDialFlingAnimation.addClass(element, 'md-is-open', addDone);
    expect(addDone).toHaveBeenCalled();

    mdFabSpeedDialFlingAnimation.removeClass(element, 'md-is-open', removeDone);
    expect(removeDone).toHaveBeenCalled();
  }));

  it('properly finishes the scale animation', inject(function (mdFabSpeedDialScaleAnimation) {
    build(
      '<md-fab-speed-dial md-open="isOpen" class="md-fling">' +
      '  <md-fab-trigger><button></button></md-fab-trigger>' +
      '  <md-fab-actions><button></button></md-fab-actions>' +
      '</md-fab-speed-dial>'
    );

    var addDone = jasmine.createSpy('addDone');
    var removeDone = jasmine.createSpy('removeDone');

    mdFabSpeedDialScaleAnimation.addClass(element, 'md-is-open', addDone);
    expect(addDone).toHaveBeenCalled();

    mdFabSpeedDialScaleAnimation.removeClass(element, 'md-is-open', removeDone);
    expect(removeDone).toHaveBeenCalled();
  }));

  function build(template) {
    inject(function ($compile) {
      pageScope = $rootScope.$new();
      element = $compile(template)(pageScope);
      controller = element.controller('mdFabSpeedDial');

      pageScope.$apply();
    });
  }

});
