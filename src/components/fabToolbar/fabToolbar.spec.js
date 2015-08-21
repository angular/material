describe('<md-fab-toolbar> directive', function() {

  beforeEach(module('material.components.fabToolbar'));

  var pageScope, element, controller;

  function build(template) {
    inject(function($compile, $rootScope) {
      pageScope = $rootScope.$new();
      element = $compile(template)(pageScope);
      controller = element.controller('mdFabToolbar');

      pageScope.$apply();
    });
  }

  it('applies a class for each direction', inject(function() {
    build(
      '<md-fab-toolbar md-direction="{{direction}}"></md-fab-toolbar>'
    );

    pageScope.$apply('direction = "left"');
    expect(element.hasClass('md-left')).toBe(true);

    pageScope.$apply('direction = "right"');
    expect(element.hasClass('md-right')).toBe(true);
  }));

  it('accepts a string for md-direction', inject(function() {
    build(
      '<md-fab-toolbar md-direction="right"></md-fab-toolbar>'
    );

    expect(element.hasClass('md-right')).toBe(true);
  }));

  it('allows programmatic opening through the md-open attribute', inject(function() {
    build(
      '<md-fab-toolbar md-open="isOpen"></md-fab-toolbar>'
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

  it('properly finishes the animation', inject(function(mdFabToolbarAnimation) {
    build(
      '<md-fab-toolbar md-open="isOpen">' +
      '  <md-fab-trigger><button></button></md-fab-trigger>' +
      '  <md-fab-actions><md-toolbar><button></button></md-toolbar></md-fab-actions>' +
      '</md-fab-toolbar>'
    );

    var addDone = jasmine.createSpy('addDone');
    var removeDone = jasmine.createSpy('removeDone');

    mdFabToolbarAnimation.addClass(element, 'md-is-open', addDone);
    expect(addDone).toHaveBeenCalled();

    mdFabToolbarAnimation.removeClass(element, 'md-is-open', removeDone);
    expect(removeDone).toHaveBeenCalled();
  }));

});