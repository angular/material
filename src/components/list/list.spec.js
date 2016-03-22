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

  it('forwards click events for md-checkbox', function() {
    var listItem = setup(
      '<md-list-item>' +
        '<md-checkbox ng-model="modelVal"></md-checkbox>' +
      '</md-list-item>');

    var cntr = listItem[0].querySelector('div');

    cntr.click();
    expect($rootScope.modelVal).toBe(true);

    cntr.click();
    expect($rootScope.modelVal).toBe(false);

  });

  it('forwards click events for md-switch', function() {
    var listItem = setup(
      '<md-list-item>' +
        '<md-switch ng-model="modelVal"></md-switch>' +
      '</md-list-item>');

    var cntr = listItem[0].querySelector('div');

    cntr.click();
    expect($rootScope.modelVal).toBe(true);

    cntr.click();
    expect($rootScope.modelVal).toBe(false);
  });

  it('should convert spacebar keypress events as clicks', inject(function($mdConstant) {
    var listItem = setup(
      '<md-list-item>' +
        '<md-checkbox ng-model="modelVal"></md-checkbox>' +
      '</md-list-item>');

    var checkbox = angular.element(listItem[0].querySelector('md-checkbox'));

    expect($rootScope.modelVal).toBeFalsy();

    checkbox.triggerHandler({
      type: 'keypress',
      keyCode: $mdConstant.KEY_CODE.SPACE
    });

    expect($rootScope.modelVal).toBe(true);
  }));

  it('should not convert spacebar keypress for text areas', inject(function($mdConstant) {
    var listItem = setup(
      '<md-list-item>' +
        '<textarea ng-model="modelVal">' +
      '</md-list-item>');

    var inputEl = angular.element(listItem[0].querySelector('textarea')[0]);

    expect($rootScope.modelVal).toBeFalsy();

    inputEl.triggerHandler({
      type: 'keypress',
      keyCode: $mdConstant.KEY_CODE.SPACE
    });

    expect($rootScope.modelVal).toBeFalsy();
  }));

  it('should not convert spacebar keypress for editable elements', inject(function($mdConstant) {
    var listItem = setup(
      '<md-list-item>' +
        '<div contenteditable="true"></div>' +
      '</md-list-item>');

    var editableEl = listItem.find('div');
    var onClickSpy = jasmine.createSpy('onClickSpy');

    // We need to append our element to the DOM because the browser won't detect `contentEditable` when the element
    // is hidden in the DOM. See the related issue for chromium:
    // https://code.google.com/p/chromium/issues/detail?id=313082
    document.body.appendChild(listItem[0]);

    editableEl.on('click', onClickSpy);

    // We need to dispatch the keypress natively, because otherwise the `keypress` won't be triggered in the list.
    var event = document.createEvent('Event');
    event.keyCode = $mdConstant.KEY_CODE.SPACE;
    event.initEvent('keypress', true, true);

    editableEl[0].dispatchEvent(event);

    expect(onClickSpy).not.toHaveBeenCalled();

    document.body.removeChild(listItem[0]);
  }));

  it('creates buttons when used with ng-click', function() {
    var listItem = setup(
      '<md-list-item ng-click="sayHello()" ng-disabled="true">' +
        '<p>Hello world</p>' +
      '</md-list-item>');

    // List items, which are clickable always contain a button wrap at the top level.
    var buttonWrap = listItem.children().eq(0);
    expect(listItem).toHaveClass('_md-button-wrap');

    // The button wrap should contain the button executor, the inner content, flex filler and the
    // secondary item container as children.
    expect(buttonWrap.children().length).toBe(4);

    var buttonExecutor = buttonWrap.children()[0];

    // The list item should forward the click and disabled attributes.
    expect(buttonExecutor.hasAttribute('ng-click')).toBe(true);
    expect(buttonExecutor.hasAttribute('ng-disabled')).toBe(true);

    var innerContent = buttonWrap.children()[1];

    expect(innerContent.nodeName).toBe('DIV');
    expect(innerContent.firstElementChild.nodeName).toBe('P');
  });

  it('creates buttons when used with ui-sref', function() {
    var listItem = setup(
      '<md-list-item ui-sref="somestate">' +
        '<p>Hello world</p>' +
      '</md-list-item>');

    // List items, which are clickable always contain a button wrap at the top level.
    var buttonWrap = listItem.children().eq(0);
    expect(listItem).toHaveClass('_md-button-wrap');

    // The button wrap should contain the button executor, the inner content, flex filler and the
    // secondary item container as children.
    expect(buttonWrap.children().length).toBe(4);

    var buttonExecutor = buttonWrap.children()[0];

    // The list item should forward the ui-sref attribute.
    expect(buttonExecutor.hasAttribute('ui-sref')).toBe(true);

    var innerContent = buttonWrap.children()[1];

    expect(innerContent.nodeName).toBe('DIV');
    expect(innerContent.firstElementChild.nodeName).toBe('P');
  });

  it('creates buttons when used with href', function() {
    var listItem = setup(
      '<md-list-item href="/somewhere">' +
        '<p>Hello world</p>' +
      '</md-list-item>');

    // List items, which are clickable always contain a button wrap at the top level.
    var buttonWrap = listItem.children().eq(0);
    expect(listItem).toHaveClass('_md-button-wrap');

    // The button wrap should contain the button executor, the inner content, flex filler and the
    // secondary item container as children.
    expect(buttonWrap.children().length).toBe(4);

    var buttonExecutor = buttonWrap.children()[0];

    // The list item should forward the href attribute.
    expect(buttonExecutor.hasAttribute('href')).toBe(true);

    var innerContent = buttonWrap.children()[1];

    expect(innerContent.nodeName).toBe('DIV');
    expect(innerContent.firstElementChild.nodeName).toBe('P');
  });

  it('moves aria-label to primary action', function() {
    var listItem = setup('<md-list-item ng-click="sayHello()" aria-label="Hello"></md-list-item>');

    var buttonWrap = listItem.children().eq(0);
    expect(listItem).toHaveClass('_md-button-wrap');

    // The actual click button will be a child of the button.md-no-style wrapper.
    var buttonExecutor = buttonWrap.children()[0];
    
    expect(buttonExecutor.nodeName).toBe('MD-BUTTON');
    expect(buttonExecutor.getAttribute('aria-label')).toBe('Hello');
  });

  it('moves secondary items outside of the button', function() {
    var listItem = setup(
      '<md-list-item ng-click="sayHello()">' +
        '<p>Hello World</p>' +
        '<md-icon class="md-secondary" ng-click="goWild()"></md-icon>' +
      '</md-list-item>');

    // First child is our button wrap
    var firstChild = listItem.children().eq(0);
    expect(firstChild[0].nodeName).toBe('DIV');

    expect(listItem).toHaveClass('_md-button-wrap');

    // It should contain three elements, the button overlay, inner content, flex filler
    // and the secondary container.
    expect(firstChild.children().length).toBe(4);

    var secondaryContainer = firstChild.children().eq(3);
    expect(secondaryContainer).toHaveClass('_md-secondary-container');

    // The secondary container should contain the md-icon,
    // which has been transformed to an icon button.
    expect(secondaryContainer.children()[0].nodeName).toBe('MD-BUTTON');
  });

  it('moves multiple md-secondary items outside of the button', function() {
    var listItem = setup(
      '<md-list-item ng-click="sayHello()">' +
        '<p>Hello World</p>' +
        '<md-icon class="md-secondary" ng-click="goWild()"></md-icon>' +
        '<md-icon class="md-secondary" ng-click="goWild2()"></md-icon>' +
      '</md-list-item>');

    // First child is our button wrap
    var firstChild = listItem.children().eq(0);
    expect(firstChild[0].nodeName).toBe('DIV');

    expect(listItem).toHaveClass('_md-button-wrap');

    // It should contain three elements, the button overlay, inner content, flex filler
    // and the secondary container.
    expect(firstChild.children().length).toBe(4);

    var secondaryContainer = firstChild.children().eq(3);
    expect(secondaryContainer).toHaveClass('_md-secondary-container');

    // The secondary container should hold the two secondary items.
    expect(secondaryContainer.children().length).toBe(2);

    expect(secondaryContainer.children()[0].nodeName).toBe('MD-BUTTON');
    expect(secondaryContainer.children()[1].nodeName).toBe('MD-BUTTON');
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
    expect(listItem.hasClass('_md-no-proxy')).toBeTruthy();
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
      expect(listItem[0].querySelector('md-button button.md-secondary')).toBeFalsy();
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
      expect(listItem[0].querySelector('md-button md-button.md-secondary')).toBeFalsy();
    });
  });

});
