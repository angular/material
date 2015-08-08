describe('<md-fab-trigger> directive', function() {

  beforeEach(module('material.components.fabSpeedDial'));
  beforeEach(module('material.components.fabToolbar'));

  var pageScope, element, controller;

  function compileAndLink(template) {
    inject(function($compile, $rootScope) {
      pageScope = $rootScope.$new();
      element = $compile(template)(pageScope);

      pageScope.$apply();
    });
  }

  it('toggles the parent fab speed dial isOpen state when clicked', inject(function() {
    compileAndLink(
      '<md-fab-speed-dial>' +
      '  <md-fab-trigger>' +
      '    <md-button></md-button>' +
      '  </md-fab-trigger>' +
      '</md-fab-speed-dial>'
    );

    controller = element.controller('mdFabSpeedDial');

    // Click to open
    element.find('md-button').triggerHandler('click');
    pageScope.$digest();

    expect(controller.isOpen).toBe(true);

    // Click to close
    element.find('md-button').triggerHandler('click');
    pageScope.$digest();

    expect(controller.isOpen).toBe(false);
  }));

  it('toggles the parent fab toolbar isOpen state when clicked', inject(function() {
    compileAndLink(
      '<md-fab-toolbar>' +
      '  <md-fab-trigger>' +
      '    <md-button></md-button>' +
      '  </md-fab-trigger>' +
      '  <md-fab-actions>' +
      '    <md-button></md-button>' +
      '  </md-fab-actions>' +
      '</md-fab-toolbar>'
    );

    var button = angular.element(element.find('md-button')[0]);

    controller = element.controller('mdFabToolbar');

    // Click to open
    button.triggerHandler('click');
    pageScope.$digest();

    expect(controller.isOpen).toBe(true);

    // Click to close
    button.triggerHandler('click');
    pageScope.$digest();

    expect(controller.isOpen).toBe(false);
  }));

});
