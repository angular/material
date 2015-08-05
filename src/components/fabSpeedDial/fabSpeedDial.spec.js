describe('<md-fab-speed-dial> directive', function() {

  var pageScope, element, controller;
  var $rootScope, $animate, $timeout;

  beforeEach(module('material.components.fabSpeedDial'));
  beforeEach(inject(function(_$rootScope_, _$animate_, _$timeout_) {
    $rootScope = _$rootScope_;
    $animate = _$animate_;
    $timeout = _$timeout_;
  }));

  it('applies a class for each direction', inject(function() {
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

  it('allows programmatic opening through the md-open attribute', inject(function() {
    build(
      '<md-fab-speed-dial md-open="isOpen">' +
      '  <md-fab-trigger>' +
      '    <md-button></md-button>' +
      '  </md-fab-trigger>' +
      '</md-fab-speed-dial>'
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

  it('toggles the menu when the trigger clicked', inject(function() {
    build(
      '<md-fab-speed-dial>' +
      '  <md-fab-trigger>' +
      '    <md-button></md-button>' +
      '  </md-fab-trigger>' +
      '</md-fab-speed-dial>'
    );

    // Click to open
    var clickEvent = {
      type: 'click',
      target: element.find('md-button')
    };
    element.triggerHandler(clickEvent);
    pageScope.$digest();

    expect(controller.isOpen).toBe(true);

    // Click to close
    element.triggerHandler(clickEvent);
    pageScope.$digest();

    expect(controller.isOpen).toBe(false);
  }));


  it('closes the menu when an action is clicked', inject(function() {
    build(
      '<md-fab-speed-dial>' +
      '  <md-fab-trigger>' +
      '    <md-button></md-button>' +
      '  </md-fab-trigger>' +
      '  <md-fab-actions>' +
      '    <md-button></md-button>' +
      '  </md-fab-actions>' +
      '</md-fab-speed-dial>'
    );

    var clickEvent = {
      type: 'click',
      target: element.find('md-fab-actions').find('md-button')
    };

    // Set the menu to be open
    controller.isOpen = true;
    pageScope.$digest();

    // Click the action to close
    element.triggerHandler(clickEvent);
    pageScope.$digest();

    expect(controller.isOpen).toBe(false);
  }));

  it('opens the menu when the trigger is focused', inject(function() {
    build(
      '<md-fab-speed-dial>' +
      '  <md-fab-trigger>' +
      '    <md-button></md-button>' +
      '  </md-fab-trigger>' +
      '</md-fab-speed-dial>'
    );

    var focusEvent = {
      type: 'focusin',
      target: element.find('md-fab-trigger').find('md-button')
    };

    element.triggerHandler(focusEvent);
    pageScope.$digest();
    expect(controller.isOpen).toBe(true);
  }));

  it('closes the menu when the trigger is blurred', inject(function() {
    build(
      '<md-fab-speed-dial>' +
      '  <md-fab-trigger>' +
      '    <md-button></md-button>' +
      '  </md-fab-trigger>' +
      '</md-fab-speed-dial>'
    );

    var focusInEvent = {
      type: 'focusin',
      target: element.find('md-fab-trigger').find('md-button')
    };

    var focusOutEvent = {
      type: 'focusout',
      target: element.find('md-fab-trigger').find('md-button')
    };

    element.triggerHandler(focusInEvent);
    pageScope.$digest();
    expect(controller.isOpen).toBe(true);

    element.triggerHandler(focusOutEvent);
    pageScope.$digest();
    expect(controller.isOpen).toBe(false);
  }));


  it('properly finishes the fling animation', inject(function(mdFabSpeedDialFlingAnimation) {
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

  it('properly finishes the scale animation', inject(function(mdFabSpeedDialScaleAnimation) {
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
    inject(function($compile) {
      pageScope = $rootScope.$new();
      element = $compile(template)(pageScope);
      controller = element.controller('mdFabSpeedDial');

      pageScope.$apply();
    });
  }

});
