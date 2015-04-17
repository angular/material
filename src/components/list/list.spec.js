describe('mdListItem directive', function() {
  beforeEach(module('material.components.list', 'material.components.checkbox', 'material.components.switch'));

  function setup(html) {
    var el;
    inject(function($compile, $rootScope) {
      el = $compile(html)($rootScope);
      $rootScope.$apply();
    });
    return el;
  }

  it('forwards click events for md-checkbox', inject(function($rootScope) {
    var listItem = setup('<md-list-item><md-checkbox ng-model="modelVal"></md-checkbox></md-list-item>');
    listItem[0].querySelector('div').click();
    expect($rootScope.modelVal).toBe(true);
  }));

  it('forwards click events for md-switch', inject(function($rootScope) {
    var listItem = setup('<md-list-item><md-switch ng-model="modelVal"></md-switch></md-list-item>');
    listItem[0].querySelector('div').click();
    expect($rootScope.modelVal).toBe(true);
  }));

  it('creates buttons when used with ng-click', function() {
    var listItem = setup('<md-list-item ng-click="sayHello()"><p>Hello world</p></md-list-item>');
    var firstChild = listItem.children()[0];
    expect(firstChild.nodeName).toBe('MD-BUTTON');
    expect(firstChild.childNodes[0].nodeName).toBe('DIV');
    expect(firstChild.childNodes[0].childNodes[0].nodeName).toBe('P');
  });

  it('moves md-secondary items outside of the button', function() {
    var listItem = setup('<md-list-item ng-click="sayHello()"><p>Hello World</p><md-icon class="md-secondary" ng-click="goWild()"></md-icon></md-list-item>');
    var firstChild = listItem.children()[0];
    expect(firstChild.nodeName).toBe('MD-BUTTON');
    expect(firstChild.childNodes.length).toBe(1);
    var secondChild = listItem.children()[1];
    expect(secondChild.nodeName).toBe('MD-BUTTON');
  });

});
