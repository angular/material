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

  it('disables tabbing to the trigger (go straight to first element instead)', inject(function() {
    build(
      '<md-fab-toolbar><md-fab-trigger><button></button></md-fab-trigger></md-fab-toolbar>'
    );

    expect(element.find('md-fab-trigger').find('button').attr('tabindex')).toBe('-1');
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