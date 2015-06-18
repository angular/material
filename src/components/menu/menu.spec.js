describe('md-menu directive', function() {
  var $mdMenu,$timeout;

  beforeEach(module('material.components.menu', 'ngAnimateMock'));
  beforeEach(inject(function($mdUtil, $$q, $document, _$mdMenu_, _$timeout_) {
    $mdMenu = _$mdMenu_;
    $timeout = _$timeout_;
    $mdUtil.transitionEndPromise = function() {
      return $$q.when(true);
    };
    var abandonedMenus = $document[0].querySelectorAll('.md-menu-container');
    angular.element(abandonedMenus).remove();
  }));

  function setup() {
    var menu,
        template = ''+
          '<md-menu>'+
            '<button ng-click="$mdOpenMenu($event)">Hello World</button>' +
            '<md-menu-content>' +
              '<li><md-button ng-click="doSomething()"></md-button></li>'+
            '</md-menu-content>' +
          '</md-menu>';

    inject(function($compile, $rootScope) {
      menu = $compile(template)($rootScope);
    });
    return menu;
  }

  it('errors on invalid markup', inject(function($compile, $rootScope) {
    function buildBadMenu() {
      $compile('<md-menu></md-menu>')($rootScope);
    }
    expect(buildBadMenu).toThrow();
  }));

  it('removes everything but the first element', function() {
    var menu = setup()[0];
    expect(menu.children.length).toBe(1);
    expect(menu.firstElementChild.nodeName).toBe('BUTTON');
  });

  it('opens on click', function() {
    var menu = setup();
    openMenu(menu);
    expect(getOpenMenuContainer().length).toBe(1);
    closeMenu(menu);
    expect(getOpenMenuContainer().length).toBe(0);
  });

  it('should not propagate the click event', function() {
      var clickDetected = false,  menu = setup();
      menu.on('click',function() {  clickDetected = true; });

      openMenu(menu);
      expect( clickDetected ).toBe(false);
      closeMenu(menu);
      expect( clickDetected ).toBe(false);
    });

  it('closes on backdrop click', inject(function($document) {
    var menu = setup();
    openMenu(menu);
    var menuContainer = getOpenMenuContainer();
    expect(menuContainer.length).toBe(1);
    $document.find('md-backdrop')[0].click();
    waitForMenuClose();
    menuContainer = getOpenMenuContainer();
    expect(menuContainer.length).toBe(0);
  }));

  it('closes on escape', inject(function($document, $mdConstant) {
    var menu = setup();
    openMenu(menu);
    var menuContainer = getOpenMenuContainer();
    expect(menuContainer.length).toBe(1);

    var openMenuEl = $document[0].querySelector('md-menu-content');
    pressKey(openMenuEl, $mdConstant.KEY_CODE.ESCAPE);
    waitForMenuClose();
    menuContainer = getOpenMenuContainer();
    expect(menuContainer.length).toBe(0);
  }));

  it('closes on option click', inject(function($document) {
    var menu = setup();
    openMenu(menu);

    var option = $document.find('md-button');
    option[0].click();
    waitForMenuClose();
    var menuContainer = getOpenMenuContainer();
    expect(menuContainer.length).toBe(0);
  }));

  function getOpenMenuContainer() {
    var res;
    inject(function($document) {
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
    inject(function($document) {
      $document.find('md-backdrop')[0].click();
      waitForMenuClose();
    });
  }

  function waitForMenuOpen() {
    inject(function($rootScope, $animate) {
        $rootScope.$digest();
        $animate.triggerCallbacks();
    });
  }

  function waitForMenuClose() {
    inject(function($rootScope, $animate) {
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
