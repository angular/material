describe('<md-fab-actions> directive', function() {

  beforeEach(module('material.components.fabActions'));

  var pageScope, element, controller;

  function build(template) {
    inject(function($compile, $rootScope) {
      pageScope = $rootScope.$new();
      element = $compile(template)(pageScope);
      controller = element.controller('mdFabActions');

      pageScope.$apply();
    });
  }

  it('supports static children', inject(function() {
    build(
      '<md-fab-speed-dial>' +
      '  <md-fab-actions>' +
      '    <md-button>1</md-button>' +
      '    <md-button>2</md-button>' +
      '    <md-button>3</md-button>' +
      '  </md-fab-actions>' +
      '</md-fab-speed-dial>'
    );

    expect(element.find("md-fab-actions").children().length).toBe(3);
    expect(element.find("md-fab-actions").children()).toHaveClass('md-fab-action-item');
  }));

  angular.forEach(['ng-repeat', 'data-ng-repeat', 'x-ng-repeat'], function(attr) {
    it('supports actions created by ' + attr, inject(function() {
      build(
        '<md-fab-speed-dial ng-init="nums=[1,2,3]">' +
        '  <md-fab-actions>' +
        '    <div ' + attr + '="i in nums"><md-button>{{i}}</md-button></div>' +
        '  </md-fab-actions>' +
        '</md-fab-speed-dial>'
      );

      expect(element.find("md-fab-actions").children().length).toBe(3);
      expect(element.find("md-fab-actions").children()).toHaveClass('md-fab-action-item');

      pageScope.$apply('nums=[1,2,3,4]');

      expect(element.find("md-fab-actions").children().length).toBe(4);
      expect(element.find("md-fab-actions").children()).toHaveClass('md-fab-action-item');
    }));
  });

});
