describe('material.components.menuBar', function() {
  var attachedMenuElements = [];

  beforeEach(module('material.components.menuBar'));

  afterEach(function() {
    attachedMenuElements.forEach(function(element) {
      element.remove();
    });
    attachedMenuElements = [];
  });

  describe('MenuBar', function() {
    describe('MenuBar Directive', function() {
      it('sets md-position-mode to "bottom left" on nested menus', function() {
        var menuBar = setup();
        var nestedMenu = menuBar[0].querySelector('md-menu');
        expect(nestedMenu.getAttribute('md-position-mode')).toBe('left bottom');
      });

      describe('ARIA', function() {
        it('sets role="menubar" on the menubar', function() {
          var menuBar = setup();
          var ariaRole = menuBar[0].getAttribute('role');
          expect(ariaRole).toBe('menubar');
        });
      });
    });

    describe('MenuBarCtrl', function() {
      var menuBar, ctrl;
      beforeEach(function() {
        menuBar = setup();
        ctrl = menuBar.controller('mdMenuBar');
      });
      describe('#getMenus', function() {
        it('gets the menus in the menubar', function() {
          var menus = ctrl.getMenus();
          expect(Array.isArray(menus)).toBe(true);
          expect(menus.length).toBe(3);
          expect(menus[0].nodeName).toBe('MD-MENU');
        });
      });

      describe('#getFocusedMenuIndex', function() {
        it('gets the focused menu index', function() {
          var menus = ctrl.getMenus();
          ctrl.$document = [{
            activeElement: menus[1].querySelector('button')
          }];
          expect(ctrl.getFocusedMenuIndex()).toBe(1);
        });
      });

      describe('#getFocusedMenu', function() {
        it('gets the menu at the focused index', function() {
          var menus = [{}, {}, {}];
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(1);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          expect(ctrl.getFocusedMenu()).toBe(menus[1]);
        });
      });

      describe('#focusMenu', function() {
        var focused;
        beforeEach(function() { focused = false; });
        it('focuses the next menu', function() {
          var menus = mockButtonAtIndex(1);
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(0);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          ctrl.focusMenu(1);
          expect(focused).toBe(true);
        });
        it('focuses the previous menu', function() {
          var menus = mockButtonAtIndex(1);
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(2);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          ctrl.focusMenu(-1);
          expect(focused).toBe(true);
        });

        it('does not focus prev at the start of the array', function() {
          var menus = mockButtonAtIndex(0);
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(0);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          ctrl.focusMenu(-1);
          expect(focused).toBe(false);
        });

        it('does not focus next at the end of the array', function() {
          var menus = mockButtonAtIndex(2);
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(2);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          ctrl.focusMenu(1);
          expect(focused).toBe(false);
        });

        function mockButtonAtIndex(index) {
          var result = [];
          var mockButton = {
            querySelector: function() { return {
              focus: function() { focused = true; }
            }; }
          };
          for (var i = 0; i < 3; ++i) {
            if (i == index) {
              result.push(mockButton);
            } else {
              result.push({});
            }
          }
          return result;
        }
      });

      describe('#openFocusedMenu', function() {
        it('clicks the focused menu', function() {
          var opened = false;
          spyOn(ctrl, 'getFocusedMenu').and.returnValue({
            querySelector: function() { return true }
          });
          spyOn(angular, 'element').and.returnValue({
            controller: function() { return {
              open: function() { opened = true; }
            }; }
          });
          ctrl.openFocusedMenu();
          expect(opened).toBe(true);
        });
      });

      describe('#handleKeyDown', function() {
        var keyCodes, call, called, calledWith;
        beforeEach(inject(function($injector) {
          var $mdConstant = $injector.get('$mdConstant');
          keyCodes = $mdConstant.KEY_CODE;
          called = false;
          call = function(arg) { called = true; calledWith = arg; };
        }));
        describe('DOWN_ARROW', function() {
          it('opens the currently focused menu', function() {
            spyOn(ctrl, 'openFocusedMenu').and.callFake(call);
            ctrl.handleKeyDown({ keyCode: keyCodes.DOWN_ARROW });
            expect(called).toBe(true);
          });
        });
        describe('RIGHT_ARROW', function() {
          it('focuses the next menu', function() {
            spyOn(ctrl, 'focusMenu').and.callFake(call);
            ctrl.handleKeyDown({ keyCode: keyCodes.RIGHT_ARROW });
            expect(called).toBe(true);
            expect(calledWith).toBe(1);
          });
        });
        describe('LEFT_ARROW', function() {
          it('focuses the previous menu', function() {
            spyOn(ctrl, 'focusMenu').and.callFake(call);
            ctrl.handleKeyDown({ keyCode: keyCodes.LEFT_ARROW });
            expect(called).toBe(true);
            expect(calledWith).toBe(-1);
          });
        });
      });
    });

    function setup() {
      var el;
      inject(function($compile, $rootScope) {
        el = $compile([
          '<md-menu-bar>',
            '<md-menu ng-repeat="i in [1, 2, 3]">',
              '<button ng-click="lastClicked = $index"></button>',
              '<md-menu-content></md-menu-content>',
            '</md-menu>',
          '</md-menu-bar>'
        ].join(''))($rootScope);
        $rootScope.$digest();
      });
      attachedMenuElements.push(el);

      return el;
    }
  });

  describe('md-menu-divider directive', function() {

    it('sets role="separator"', function() {
      var el = setup();
      expect(el.attr('role')).toBe('separator');
    });
    function setup() {
      var divider;
      inject(function($compile, $rootScope) {
        divider = $compile('<md-menu-divider></md-menu-divider>')($rootScope);
      });
      return divider;
    }
  });

  describe('md-menu-item directive', function() {
    describe('type="checkbox"', function() {
      it('compiles', function() {
        var menuItem = setup('ng-model="test"')[0];
        expect(menuItem.classList.contains('md-indent')).toBe(true);
        var children = menuItem.children;
        expect(children[0].nodeName).toBe('MD-ICON');
        expect(children[1].nodeName).toBe('MD-BUTTON');
      });
      it('sets aria role', function() {
        var menuItem = setup()[0].querySelector('md-button');
        expect(menuItem.getAttribute('role')).toBe('menuitemcheckbox');
      });
      it('toggles on click', function() {
        var menuItem = setup('ng-model="test"')[0];
        var button = menuItem.querySelector('md-button');
        button.click();
        inject(function($rootScope) {
          expect($rootScope.test).toBe(true);
        });
      });
      it('does not toggle if disabled', function() {
        var menuItem = setup('ng-model="test" ng-disabled="true"')[0];
        var button = menuItem.querySelector('md-button');
        button.click();
        inject(function($rootScope) {
          expect($rootScope.test).toBeFalsy();
        });
      });
      it('reflects the ng-model value', inject(function($rootScope) {
        var menuItem = setup('ng-model="test"')[0];
        var button = menuItem.querySelector('md-button');
        expect(button.getAttribute('aria-checked')).toBe('false');
        expect(menuItem.children[0].style.display).toBe('none');
        $rootScope.test = true;
        $rootScope.$digest();
        expect(menuItem.children[0].style.display).toBe('');
        expect(button.getAttribute('aria-checked')).toBe('true');
      }));

      function setup(attrs) {
        attrs = attrs || '';

        var template = '<md-menu-item type="checkbox" ' + attrs + '>Test Item</md-menu-item>'

        var checkboxMenuItem;
        inject(function($compile, $rootScope) {
          checkboxMenuItem = $compile(template)($rootScope);
          $rootScope.$digest();
        });
        return checkboxMenuItem;
      }
    });

    describe('type="radio"', function() {
      it('compiles', function() {
        var menuItem = setup('ng-model="test"')[0];
        expect(menuItem.classList.contains('md-indent')).toBe(true);
        var children = menuItem.children;
        expect(children[0].nodeName).toBe('MD-ICON');
        expect(children[1].nodeName).toBe('MD-BUTTON');
      });
      it('sets aria role', function() {
        var menuItem = setup()[0].querySelector('md-button');
        expect(menuItem.getAttribute('role')).toBe('menuitemradio');
      });
      it('toggles on click', function() {
        var menuItem = setup('ng-model="test" value="hello"')[0];
        var button = menuItem.querySelector('md-button');
        button.click();
        inject(function($rootScope) {
          expect($rootScope.test).toBe("hello");
        });
      });

      it('does not toggle if disabled', function() {
        var menuItem = setup('ng-model="test" value="hello" ng-disabled="true"')[0];
        var button = menuItem.querySelector('md-button');
        button.click();
        inject(function($rootScope) {
          expect($rootScope.test).toBeFalsy();
        });
      });

      it('reflects the ng-model value', inject(function($rootScope) {
        $rootScope.test = 'apple';
        var menuItem = setup('ng-model="test" value="hello"')[0];
        var button = menuItem.querySelector('md-button');
        expect(button.getAttribute('aria-checked')).toBe('false');
        expect(menuItem.children[0].style.display).toBe('none');
        $rootScope.test = 'hello';
        $rootScope.$digest();
        expect(menuItem.children[0].style.display).toBeFalsy();
        expect(button.getAttribute('aria-checked')).toBe('true');
      }));

      function setup(attrs) {
        attrs = attrs || '';

        var template = '<md-menu-item type="radio" ' + attrs + '>Test Item</md-menu-item>'

        var radioMenuItem;
        inject(function($compile, $rootScope) {
          radioMenuItem = $compile(template)($rootScope);
          $rootScope.$digest();
        });
        return radioMenuItem;
      }
    });
  });
});

