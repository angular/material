describe('mdListItem directive', function() {
  var $compile, $rootScope;

  beforeEach(module('material.components.list', 'material.components.checkbox', 'material.components.switch'));
  beforeEach(inject(function(_$compile_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  function setup(html) {
    var el;
    inject(function($compile, $rootScope) {
      el = $compile(html)($rootScope);
      $rootScope.$apply();
    });
    return el;
  }

  it('supports empty list items',function() {
    var list = setup('\
                 <md-list>\
                   <md-list-item></md-list-item>\
                 </md-list>'
               );

    var cntr = list[0].querySelector('div');

    if (cntr && cntr.click ) {
      cntr.click();
      expect($rootScope.modelVal).toBe(false);
    }

  });

  it('forwards click events for md-checkbox', function() {
    var listItem = setup('<md-list-item><md-checkbox ng-model="modelVal"></md-checkbox></md-list-item>');
    var cntr = listItem[0].querySelector('div');

    if (cntr && cntr.click ) {
      cntr.click();
      expect($rootScope.modelVal).toBe(true);
    }

  });

  it('forwards click events for md-switch', function() {
    var listItem = setup('<md-list-item><md-switch ng-model="modelVal"></md-switch></md-list-item>');
    var cntr = listItem[0].querySelector('div');

    if (cntr && cntr.click ) {
      cntr.click();
      expect($rootScope.modelVal).toBe(true);
    }

  });

  it('should convert spacebar keypress events as clicks', inject(function($mdConstant) {
      var listItem = setup('<md-list-item><md-checkbox ng-model="modelVal"></md-checkbox></md-list-item>');
      var checkbox = angular.element(listItem[0].querySelector('md-checkbox'));

      expect($rootScope.modelVal).toBeFalsy();
      checkbox.triggerHandler({
        type: 'keypress',
        keyCode: $mdConstant.KEY_CODE.SPACE
      });
      expect($rootScope.modelVal).toBe(true);
  }));

  it('should not convert spacebar keypress for text areas', inject(function($mdConstant) {
      var listItem = setup('<md-list-item><textarea ng-model="modelVal"></md-list-item>');
      var inputEl = angular.element(listItem[0].querySelector('textarea')[0]);

      expect($rootScope.modelVal).toBeFalsy();
      inputEl.triggerHandler({
        type: 'keypress',
        keyCode: $mdConstant.KEY_CODE.SPACE
      });
      expect($rootScope.modelVal).toBeFalsy();
  }));

  xit('should not convert spacebar keypress for text inputs', inject(function($mdConstant) {

      var listItem = setup('<md-list-item><input ng-keypress="pressed = true" type="text"></md-list-item>');
      var inputEl = angular.element(listItem[0].querySelector('input')[0]);

      expect($rootScope.pressed).toBeFalsy();
      inputEl.triggerHandler({
        type: 'keypress',
        keyCode: $mdConstant.KEY_CODE.SPACE
      });
      expect($rootScope.pressed).toBe(true);
  }));


  it('creates buttons when used with ng-click', function() {
    var listItem = setup('<md-list-item ng-click="sayHello()" ng-disabled="true"><p>Hello world</p></md-list-item>');
    var firstChild = listItem.children()[0];
    expect(firstChild.nodeName).toBe('MD-BUTTON');
    expect(firstChild.hasAttribute('ng-disabled')).toBeTruthy();
    expect(firstChild.childNodes[0].nodeName).toBe('DIV');
    expect(firstChild.childNodes[0].childNodes[0].nodeName).toBe('P');
  });

  it('moves aria-label to primary action', function() {
    var listItem = setup('<md-list-item ng-click="sayHello()" aria-label="Hello"></md-list-item>');
    var listItemChildren = listItem.children();
    expect(listItemChildren[0].nodeName).toBe('MD-BUTTON');
    expect(listItemChildren.attr('aria-label')).toBe('Hello');
  });

  it('moves md-secondary items outside of the button', function() {
    var listItem = setup('<md-list-item ng-click="sayHello()"><p>Hello World</p><md-icon class="md-secondary" ng-click="goWild()"></md-icon></md-list-item>');
    var firstChild = listItem.children()[0];
    expect(firstChild.nodeName).toBe('MD-BUTTON');
    expect(firstChild.childNodes.length).toBe(1);
    var secondChild = listItem.children()[1];
    expect(secondChild.nodeName).toBe('MD-BUTTON');
  });

  it('should detect non-compiled md-buttons', function() {
    var listItem = setup('<md-list-item><md-button ng-click="sayHello()">Hello</md-button></md-list-item>');
    expect(listItem.hasClass('md-no-proxy')).toBeFalsy();
  });

});
