describe('<md-fab-toolbar> directive', function() {

  beforeEach(module('material.components.fabToolbar'));

  var pageScope, element, controller;

  function compileAndLink(template) {
    inject(function($compile, $rootScope) {
      pageScope = $rootScope.$new();
      element = $compile(template)(pageScope);
      controller = element.controller('mdFabToolbar');

      pageScope.$apply();
    });
  }

  it('disables tabbing to the trigger (go straight to first element instead)', inject(function() {
    compileAndLink(
      '<md-fab-toolbar><md-fab-trigger><button></button></md-fab-trigger></md-fab-toolbar>'
    );

    expect(element.find('md-fab-trigger').find('button').attr('tabindex')).toBe('-1');
  }));


  it('opens when the toolbar elements are focused', inject(function() {
    compileAndLink(
      '<md-fab-toolbar><md-fab-trigger><a></a></md-fab-trigger>' +
      '<md-fab-actions><button></button></md-fab-actions></md-fab-toolbar>'
    );

    element.find('button').triggerHandler('focus');
    expect(controller.isOpen).toBe(true);
  }));

  it('closes when the toolbar elements are blurred', inject(function() {
    compileAndLink(
      '<md-fab-toolbar><md-fab-actions><button></button></md-fab-actions></md-fab-toolbar>'
    );

    element.find('button').triggerHandler('focus');
    expect(controller.isOpen).toBe(true);

    element.find('button').triggerHandler('blur');
    expect(controller.isOpen).toBe(false);
  }));

  it('allows programmatic opening through the md-open attribute', inject(function() {
    compileAndLink(
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
    compileAndLink(
      '<md-fab-toolbar md-open="isOpen">' +
      '  <md-fab-trigger><button></button></md-fab-trigger>' +
      '  <md-fab-actions><button></button></md-fab-actions>' +
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