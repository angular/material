describe('mdListItem directive', function() {
  var attachedElements = [];
  var $compile, $rootScope;

  beforeEach(module('material.components.list', 'material.components.checkbox', 'material.components.switch'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  afterEach(function() {
    attachedElements.forEach(function(element) {
      element.remove();
    });
    attachedElements = [];
  });

  function setup(html) {
    var el;
    inject(function($compile, $rootScope) {
      el = $compile(html)($rootScope);
      $rootScope.$apply();
    });
    attachedElements.push(el);

    return el;
  }

  it('supports empty list items', function() {
    var list = setup('\
                 <md-list>\
                   <md-list-item></md-list-item>\
                 </md-list>'
    );

    var cntr = list[0].querySelector('div');

    if (cntr && cntr.click) {
      cntr.click();
      expect($rootScope.modelVal).toBe(false);
    }

  });

  it('forwards click events for md-checkbox', function() {
    var listItem = setup('<md-list-item><md-checkbox ng-model="modelVal"></md-checkbox></md-list-item>');
    var cntr = listItem[0].querySelector('div');

    if (cntr && cntr.click) {
      cntr.click();
      expect($rootScope.modelVal).toBe(true);
    }

  });

  it('forwards click events for md-switch', function() {
    var listItem = setup('<md-list-item><md-switch ng-model="modelVal"></md-switch></md-list-item>');
    var cntr = listItem[0].querySelector('div');

    if (cntr && cntr.click) {
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
    var buttonChild = listItem.children().children()[0];
    var innerChild = listItem.children().children()[1];
    expect(buttonChild.nodeName).toBe('MD-BUTTON');
    expect(buttonChild.hasAttribute('ng-disabled')).toBeTruthy();
    expect(innerChild.nodeName).toBe('DIV');
    expect(innerChild.childNodes[0].nodeName).toBe('P');
  });

  it('creates buttons when used with ui-sref', function() {
    var listItem = setup('<md-list-item ui-sref="somestate"><p>Hello world</p></md-list-item>');
    var firstChild = listItem.children().children()[0];
    expect(firstChild.nodeName).toBe('MD-BUTTON');
    expect(firstChild.hasAttribute('ui-sref')).toBeTruthy();
  });

  it('creates buttons when used with href', function() {
    var listItem = setup('<md-list-item href="/somewhere"><p>Hello world</p></md-list-item>');
    var firstChild = listItem.children().children()[0];
    expect(firstChild.nodeName).toBe('MD-BUTTON');
    expect(firstChild.hasAttribute('href')).toBeTruthy();
  });

  it('moves aria-label to primary action', function() {
    var listItem = setup('<md-list-item ng-click="sayHello()" aria-label="Hello"></md-list-item>');
    var listItemChildren = listItem.children();
    expect(listItemChildren[0].nodeName).toBe('DIV');
    expect(listItemChildren).toHaveClass('md-button');
    expect(listItemChildren.children()[0].getAttribute('aria-label')).toBe('Hello');
  });

  it('moves md-secondary items outside of the button', function() {
    var listItem = setup('<md-list-item ng-click="sayHello()"><p>Hello World</p><md-icon class="md-secondary" ng-click="goWild()"></md-icon></md-list-item>');
    // First child is our button and content holder
    var firstChild = listItem.children().eq(0);
    expect(firstChild[0].nodeName).toBe('DIV');
    // It should contain two elements, the button overlay and the actual content
    expect(firstChild.children().length).toBe(2);
    var secondChild = listItem.children().eq(1);
    expect(secondChild[0].nodeName).toBe('MD-BUTTON');
    expect(secondChild.hasClass('md-secondary-container')).toBeTruthy();
  });

  it('moves multiple md-secondary items outside of the button', function() {
    var listItem = setup('<md-list-item ng-click="sayHello()"><p>Hello World</p><md-icon class="md-secondary" ng-click="goWild()"><md-icon class="md-secondary" ng-click="goWild2()"></md-icon></md-list-item>');
    // First child is our button and content holder
    var firstChild = listItem.children().eq(0);
    expect(firstChild[0].nodeName).toBe('DIV');
    // It should contain two elements, the button overlay and the actual content
    expect(firstChild.children().length).toBe(2);
    var secondChild = listItem.children().eq(1);
    expect(secondChild[0].nodeName).toBe('DIV');
    expect(secondChild.hasClass('md-secondary-container')).toBeTruthy();
    expect(secondChild.children().length).toBe(2);
    var secondaryBtnOne = secondChild.children().eq(0);
    expect(secondaryBtnOne[0].nodeName).toBe('MD-BUTTON');
    expect(secondaryBtnOne.hasClass('md-secondary-container')).toBeFalsy();
    var secondaryBtnTwo = secondChild.children().eq(1);
    expect(secondaryBtnTwo[0].nodeName).toBe('MD-BUTTON');
    expect(secondaryBtnTwo.hasClass('md-secondary-container')).toBeFalsy();
  });

  it('should detect non-compiled md-buttons', function() {
    var listItem = setup('<md-list-item><md-button ng-click="sayHello()">Hello</md-button></md-list-item>');
    expect(listItem.hasClass('md-no-proxy')).toBeFalsy();
  });

  it('should not detect secondary or excluded md-buttons', function() {
    var listItem = setup(
      '<md-list-item>' +
      '  <div>Content Here</div>' +
      '  <md-button class="md-secondary" ng-click="sayHello()">Hello</md-button>' +
      '  <md-button class="md-exclude" ng-click="sayHello()">Hello</md-button>' +
      '</md-list-item>'
    );
    expect(listItem.hasClass('md-no-proxy')).toBeTruthy();
  });

  it('should copy md-icon.md-secondary attributes to the button', function() {
    var listItem = setup(
      '<md-list-item>' +
      '  <div>Content Here</div>' +
      '  <md-checkbox></md-checkbox>' +
      '  <md-icon class="md-secondary" ng-click="sayHello()" ng-disabled="true">Hello</md-icon>' +
      '</md-list-item>'
    );

    var button = listItem.find('md-button');

    expect(button[0].hasAttribute('ng-click')).toBeTruthy();
    expect(button[0].hasAttribute('ng-disabled')).toBeTruthy();
  });

  describe('with a clickable item', function() {

    it('should wrap secondary icons in a md-button', function() {
      var listItem = setup(
        '<md-list-item ng-click="something()">' +
        '  <p>Content Here</p>' +
        '  <md-icon class="md-secondary" ng-click="heart()">heart</md-icon>' +
        '</md-list-item>'
      );

      var buttons = listItem.find('md-button');

      // Check that we wrapped the icon
      expect(listItem[0].querySelector('md-button > md-icon')).toBeTruthy();

      // Check the button actions
      expect(buttons[0].attributes['ng-click'].value).toBe("something()");
      expect(buttons[1].attributes['ng-click'].value).toBe("heart()");
    });

    it('should not wrap secondary buttons in a md-button', function() {
      var listItem = setup(
        '<md-list-item ng-click="something()">' +
        '  <p>Content Here</p>' +
        '  <button class="md-secondary" ng-click="like()">Like</button>' +
        '</md-list-item>'
      );

      // There should only be 1 md-button (the wrapper) and one button (the unwrapped one)
      expect(listItem.find('md-button').length).toBe(1);
      expect(listItem.find('button').length).toBe(1);

      // Check that we didn't wrap the button in an md-button
      expect(listItem[0].querySelector('md-button button')).toBeFalsy();
    });

    it('should not wrap secondary md-buttons in a md-button', function() {
      var listItem = setup(
        '<md-list-item ng-click="something()">' +
        '  <p>Content Here</p>' +
        '  <md-button class="md-secondary" ng-click="like()">Like</md-button>' +
        '</md-list-item>'
      );

      // There should be 2 md-buttons that are siblings
      expect(listItem.find('md-button').length).toBe(2);

      // Check that we didn't wrap the md-button in an md-button
      expect(listItem[0].querySelector('md-button md-button')).toBeFalsy();
    });
  });

});
