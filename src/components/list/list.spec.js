describe('mdListItem directive', function() {
  var attachedElements = [];
  var $compile, $rootScope;

  beforeEach(module(
    'material.components.list',
    'material.components.checkbox',
    'material.components.switch',
    'material.components.button'
  ));

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

  describe('md-list-item', function() {
    it('should have `._md` class indicator', inject(function($compile, $rootScope) {
      var element = $compile('<md-list><md-list-item></md-list-item></md-list>')($rootScope.$new());
      expect(element.find('md-list-item').hasClass('_md')).toBe(true);
    }));
  });

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

  it('should not wrap when proxies are disabled', function() {
    var listItem = setup(
      '<md-list-item class="md-no-proxy">' +
        '<md-switch ng-model="modelVal"></md-switch>' +
      '</md-list-item>'
    );

    var switchEl = listItem[0].querySelector('md-switch');

    // If proxies are disabled, the list will not wrap anything.
    expect(switchEl.parentNode).toBe(listItem[0]);

    listItem.triggerHandler('click');
    expect($rootScope.modelVal).toBeFalsy();

    switchEl.click();
    expect($rootScope.modelVal).toBeTruthy();

    expect(listItem).not.toHaveClass('md-clickable')
  });

  it('should not trigger the proxy element, when clicking on a slider', function() {
    var listItem = setup(
      '<md-list-item>' +
        '<md-slider></md-slider>' +
        '<md-switch ng-model="modelVal"></md-switch>' +
      '</md-list-item>');

    var slider = listItem.find('md-slider')[0];

    slider.click();

    expect($rootScope.modelVal).toBeFalsy();
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

    // The button wrap should contain the button executor, the inner content and the
    // secondary item container as children.
    expect(buttonWrap.children().length).toBe(3);

    var buttonExecutor = buttonWrap.children()[0];

    // The list item should forward the click and disabled attributes.
    expect(buttonExecutor.hasAttribute('ng-click')).toBe(true);
    expect(buttonExecutor.hasAttribute('ng-disabled')).toBe(true);

    var innerContent = buttonWrap.children()[1];

    expect(innerContent.nodeName).toBe('DIV');
    expect(innerContent.firstElementChild.nodeName).toBe('P');
  });

  it('creates buttons when used with ng-dblclick', function() {
    var listItem = setup(
      '<md-list-item ng-dblclick="sayHello()" ng-disabled="true">' +
        '<p>Hello world</p>' +
      '</md-list-item>');

    // List items, which are clickable always contain a button wrap at the top level.
    var buttonWrap = listItem.children().eq(0);
    expect(listItem).toHaveClass('_md-button-wrap');

    // The button wrap should contain the button executor, the inner content and the
    // secondary item container as children.
    expect(buttonWrap.children().length).toBe(3);

    var buttonExecutor = buttonWrap.children()[0];

    // The list item should forward the click and disabled attributes.
    expect(buttonExecutor.hasAttribute('ng-dblclick')).toBe(true);
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

    // The button wrap should contain the button executor, the inner content and the
    // secondary item container as children.
    expect(buttonWrap.children().length).toBe(3);

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

    // The button wrap should contain the button executor, the inner content and the
    // secondary item container as children.
    expect(buttonWrap.children().length).toBe(3);

    var buttonExecutor = buttonWrap.children()[0];

    // The list item should forward the href attribute.
    expect(buttonExecutor.hasAttribute('href')).toBe(true);

    var innerContent = buttonWrap.children()[1];

    expect(innerContent.nodeName).toBe('DIV');
    expect(innerContent.firstElementChild.nodeName).toBe('P');
  });

  it('should forward the md-no-focus class', function() {
    var listItem = setup(
      '<md-list-item ng-click="null" class="md-no-focus">' +
        '<p>Clickable - Without Focus Style</p>' +
      '</md-list-item>');

    // List items, which are clickable always contain a button wrap at the top level.
    var buttonWrap = listItem.children().eq(0);
    expect(listItem).toHaveClass('_md-button-wrap');

    // The button wrap should contain the button executor, the inner content and the
    // secondary item container as children.
    expect(buttonWrap.children().length).toBe(3);

    var buttonExecutor = buttonWrap.children();

    // The list item should forward the href and md-no-focus-style attribute.
    expect(buttonExecutor.attr('ng-click')).toBeTruthy();
    expect(buttonExecutor.hasClass('md-no-focus')).toBe(true);
  });

  it('moves aria-label to primary action', function() {
    var listItem = setup('<md-list-item ng-click="sayHello()" aria-label="Hello"></md-list-item>');

    var buttonWrap = listItem.children().eq(0);
    expect(listItem).toHaveClass('_md-button-wrap');

    // The actual click button will be a child of the button.md-no-style wrapper.
    var buttonExecutor = buttonWrap.children()[0];

    expect(buttonExecutor.nodeName).toBe('BUTTON');
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

    // It should contain three elements, the button overlay, inner content
    // and the secondary container.
    expect(firstChild.children().length).toBe(3);

    var secondaryContainer = firstChild.children().eq(2);
    expect(secondaryContainer).toHaveClass('md-secondary-container');

    // The secondary container should contain the md-icon,
    // which has been transformed to an icon button.
    expect(secondaryContainer.children()[0].nodeName).toBe('BUTTON');
  });

  it('should copy ng-show to the generated button parent of a clickable secondary item', function() {
    var listItem = setup(
      '<md-list-item ng-click="sayHello()">' +
        '<p>Hello World</p>' +
        '<md-icon class="md-secondary" ng-show="isShown" ng-click="goWild()"></md-icon>' +
      '</md-list-item>');

    // First child is our button wrap
    var firstChild = listItem.children().eq(0);
    expect(firstChild[0].nodeName).toBe('DIV');

    expect(listItem).toHaveClass('_md-button-wrap');

    // It should contain three elements, the button overlay, inner content
    // and the secondary container.
    expect(firstChild.children().length).toBe(3);

    var secondaryContainer = firstChild.children().eq(2);
    expect(secondaryContainer).toHaveClass('md-secondary-container');

    // The secondary container should contain the md-icon,
    // which has been transformed to an icon button.
    var iconButton = secondaryContainer.children()[0];

    expect(iconButton.nodeName).toBe('BUTTON');
    expect(iconButton.hasAttribute('ng-show')).toBe(true);

    // The actual `md-icon` element, should not have the ng-show attribute anymore.
    expect(iconButton.firstElementChild.hasAttribute('ng-show')).toBe(false);
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

    // It should contain three elements, the button overlay, inner content,
    // and the secondary container.
    expect(firstChild.children().length).toBe(3);

    var secondaryContainer = firstChild.children().eq(2);
    expect(secondaryContainer).toHaveClass('md-secondary-container');

    // The secondary container should hold the two secondary items.
    expect(secondaryContainer.children().length).toBe(2);

    expect(secondaryContainer.children()[0].nodeName).toBe('BUTTON');
    expect(secondaryContainer.children()[1].nodeName).toBe('BUTTON');
  });

  it('should not detect a normal button as a proxy element', function() {
    var listItem = setup('<md-list-item><md-button ng-click="sayHello()">Hello</md-button></md-list-item>');
    expect(listItem.hasClass('md-no-proxy')).toBeTruthy();
  });

  it('should not detect a secondary button as a proxy element', function() {
    var listItem = setup(
      '<md-list-item>' +
      '  <div>Content Here</div>' +
      '  <md-button class="md-secondary" ng-click="sayHello()">Hello</md-button>' +
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

    var button = listItem.find('button');

    expect(button[0].hasAttribute('ng-click')).toBeTruthy();
    expect(button[0].hasAttribute('ng-disabled')).toBeTruthy();
  });

  describe('with a md-menu', function() {

    it('should forward click events on the md-menu trigger button', function() {
      var template =
        '<md-list-item>' +
          '<md-menu>' +
            '<md-button ng-click="openMenu()"></md-button>' +
        ' </md-menu>' +
        '</md-list-item>';

      var listItem = setup(template);
      var cntr = listItem[0].querySelector('div');
      var openMenu = jasmine.createSpy('openMenu');

      $rootScope.openMenu = openMenu;

      if (cntr && cntr.click) {
        cntr.click();
        expect(openMenu).toHaveBeenCalled();
      }

    });

    it('should detect the menu position mode when md-menu is aligned at right', function() {
      var template =
        '<md-list-item>' +
          '<span>Menu should be aligned right</span>' +
          '<md-menu>' +
            '<md-button ng-click="openMenu()"></md-button>' +
          '</md-menu>' +
        '</md-list-item>';

      var listItem = setup(template);

      var mdMenu = listItem.find('md-menu');

      expect(mdMenu.attr('md-position-mode')).toBe('right target');
    });

    it('should detect the menu position mode when md-menu is aligned at left', function() {
      var template =
        '<md-list-item>' +
          '<md-menu>' +
            '<md-button ng-click="openMenu()"></md-button>' +
          '</md-menu>' +
          '<span>Menu should be aligned left</span>' +
        '</md-list-item>';

      var listItem = setup(template);

      var mdMenu = listItem.find('md-menu');

      expect(mdMenu.attr('md-position-mode')).toBe('left target');
    });

    it('should apply an aria-label if not specified', function() {
      var template =
        '<md-list-item>' +
          '<span>Aria Label Menu</span>' +
          '<md-menu>' +
            '<md-button ng-click="openMenu()"></md-button>' +
          '</md-menu>' +
        '</md-list-item>';

      var listItem = setup(template);

      var mdMenuButton = listItem[0].querySelector('md-menu > button');

      expect(mdMenuButton.getAttribute('aria-label')).toBe('Open List Menu');
    });

    it('should apply $mdMenuOpen to the button if not present', function() {
      var template =
        '<md-list-item>' +
          '<span>Aria Label Menu</span>' +
          '<md-menu>' +
            '<md-button>Should Open the Menu</md-button>' +
          '</md-menu>' +
        '</md-list-item>';

      var listItem = setup(template);

      var mdMenuButton = listItem[0].querySelector('md-menu > button');

      expect(mdMenuButton.getAttribute('ng-click')).toBe('$mdMenu.open($event)');
    });
  });

  describe('aria-label', function() {

    it('should copy label to the button executor element', function() {
      var listItem = setup('<md-list-item ng-click="null" aria-label="Test">');
      var buttonEl = listItem.find('button');

      // The aria-label attribute should be moved to the button element.
      expect(buttonEl.attr('aria-label')).toBe('Test');
      expect(listItem.attr('aria-label')).toBeFalsy();
    });

    it('should determine the label from the content if not set', function() {
      var listItem = setup(
        '<md-list-item ng-click="null">' +
          '<span>Content</span>' +
          '<span aria-hidden="true">Hidden</span>' +
        '</md-list-item>'
      );

      var buttonEl = listItem.find('button');

      // The aria-label attribute should be determined from the content.
      expect(buttonEl.attr('aria-label')).toBe('Content');
    });

    it('should determine the label from the bound content if aria-label is not set', function() {
      var listItem = setup(
        '<md-list-item ng-click="null">' +
        '<span>{{ content }}</span>' +
        '<span aria-hidden="true">Hidden</span>' +
        '</md-list-item>'
      );

      $rootScope.$apply('content = "Content"');

      var buttonEl = listItem.find('button');

      // The aria-label attribute should be determined from the content.
      expect(buttonEl.attr('aria-label')).toBe('Content');
    });

    it('should warn when label is missing and content is empty', inject(function($log) {
      // Clear the log stack to assert that a new warning has been added.
      $log.reset();

      setup('<md-list-item ng-click="null">');

      // Expect $log to have one $mdAria warning, because the button misses an aria-label.
      expect($log.warn.logs.length).toBe(1);
    }));

  });

  describe('with a clickable item', function() {

    it('should wrap secondary icons in a md-button', function() {
      var listItem = setup(
        '<md-list-item ng-click="something()">' +
        '  <p>Content Here</p>' +
        '  <md-icon class="md-secondary" ng-click="heart()">heart</md-icon>' +
        '</md-list-item>'
      );

      var buttons = listItem.find('button');

      // Check that we wrapped the icon
      expect(listItem[0].querySelector('button > md-icon')).toBeTruthy();

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

      // There should be two buttons (the button executor, and the secondary item)
      expect(listItem.find('button').length).toBe(2);

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

      // There should be 2 buttons that are siblings
      expect(listItem.find('button').length).toBe(2);

      // Check that we didn't wrap the md-button in an md-button
      expect(listItem[0].querySelector('button.md-button button.md-button.md-secondary')).toBeFalsy();
    });
  });

});
