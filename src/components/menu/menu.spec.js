describe('md-menu directive', function () {
  var $mdMenu, $timeout, something;

  beforeEach(module('material.components.menu'));
  beforeEach(inject(function ($mdUtil, $$q, $document, _$mdMenu_, _$timeout_) {
    $mdMenu = _$mdMenu_;
    $timeout = _$timeout_;
    $mdUtil.dom.animator.waitTransitionEnd = function () {
      return $$q.when(true);
    };
    var abandonedMenus = $document[0].querySelectorAll('.md-menu-container');
    angular.element(abandonedMenus).remove();
  }));
  afterEach(function () {
    something = false;
  });

  it('errors on invalid markup', inject(function ($compile, $rootScope) {
    function buildBadMenu() {
      $compile('<md-menu></md-menu>')($rootScope);
    }

    expect(buildBadMenu).toThrow();
  }));

  it('removes everything but the first element', function () {
    var menu = setup()[0];
    expect(menu.children.length).toBe(1);
    expect(menu.firstElementChild.nodeName).toBe('BUTTON');
  });

  it('opens on click', function () {
    var menu = setup();
    openMenu(menu);
    expect(getOpenMenuContainer().length).toBe(1);
    closeMenu(menu);
    expect(getOpenMenuContainer().length).toBe(0);
  });

  it('should not propagate the click event', function () {
    var clickDetected = false, menu = setup();
    menu.on('click', function () {
      clickDetected = true;
    });

    openMenu(menu);
    expect(clickDetected).toBe(false);
    closeMenu(menu);
    expect(clickDetected).toBe(false);
  });

  it('closes on backdrop click', inject(function ($document) {
    openMenu(setup());

    expect(getOpenMenuContainer().length).toBe(1);

    $document.find('md-backdrop').triggerHandler('click');
    waitForMenuClose();

    expect(getOpenMenuContainer().length).toBe(0);
  }));

  it('closes on escape', inject(function ($document, $mdConstant) {
    openMenu(setup());
    expect(getOpenMenuContainer().length).toBe(1);

    var openMenuEl = $document[0].querySelector('md-menu-content');

    pressKey(openMenuEl, $mdConstant.KEY_CODE.ESCAPE);
    waitForMenuClose();

    expect(getOpenMenuContainer().length).toBe(0);
  }));

  describe('closes with -', function() {
    it('closes on normal option click', function () {
      expect(getOpenMenuContainer().length).toBe(0);

      openMenu(setup());

      expect(something).toBeFalsy();
      expect(getOpenMenuContainer().length).toBe(1);

      var btn = getOpenMenuContainer()[0].querySelector('md-button');
          btn.click();

      waitForMenuClose();

      expect(something).toBeTruthy();

      expect(getOpenMenuContainer().length).toBe(0);
    });

    itClosesWithAttributes([
      'data-ng-click', 'x-ng-click',
      'ui-sref','data-ui-sref', 'x-ui-sref',
      'ng-href', 'data-ng-href', 'x-ng-href'
    ]);

    function itClosesWithAttributes(types) {
      for (var i = 0; i < types.length; ++i) {
        it('closes with ' + types[i], testAttribute(types[i]));
      }

      function testAttribute(attr) {
        return inject(function($rootScope, $compile) {
          var template = '' +
            '<md-menu>' +
            ' <button ng-click="$mdOpenMenu($event)">Hello World</button>' +
            ' <md-menu-content>' +
            '  <md-menu-item>' +
            '    <md-button ' + attr + '=""></md-button>' +
            '  </md-menu-item>' +
            ' </md-menu-content>' +
            '</md-menu>';

          openMenu($compile(template)($rootScope));
          expect(getOpenMenuContainer().length).toBe(1);

          var btn = getOpenMenuContainer()[0].querySelector('md-button');
              btn.click();

          waitForMenuClose();

          expect(getOpenMenuContainer().length).toBe(0);
        });
      }
    }
  });

  // ********************************************
  // Internal methods
  // ********************************************

  function setup() {
    var menu,
      template = '' +
        '<md-menu>' +
        ' <button ng-click="$mdOpenMenu($event)">Hello World</button>' +
        ' <md-menu-content>' +
        '  <md-menu-item>' +
        '    <md-button ng-click="doSomething($event)"></md-button>' +
        '  </md-menu-item>' +
        ' </md-menu-content>' +
        '</md-menu>';

    inject(function ($compile, $rootScope) {
      $rootScope.doSomething = function ($event) {
        something = true;
      };
      menu = $compile(template)($rootScope);
    });

    return menu;
  }

  function getOpenMenuContainer() {
    var res;
    inject(function ($document) {
      res = angular.element($document[0].querySelector('.md-open-menu-container'));
    });
    return res;
  }

  function openMenu(el) {
    el.children().eq(0).triggerHandler('click');
    waitForMenuOpen();
    $timeout.flush();
  }

  function closeMenu() {
    inject(function ($document) {
      $document.find('md-backdrop').triggerHandler('click');
      waitForMenuClose();
    });
  }

  function waitForMenuOpen() {
    inject(function ($rootScope, $animate) {
      $rootScope.$digest();
      $animate.triggerCallbacks();
    });
  }

  function waitForMenuClose() {
    inject(function ($rootScope, $animate) {
      $rootScope.$digest();
      $animate.triggerCallbacks();
      $timeout.flush();
    });
  }

  function pressKey(el, code) {
    if (!(el instanceof angular.element)) {
      el = angular.element(el);
    }
    el.triggerHandler({
      type: 'keydown',
      keyCode: code
    });
  }
});
