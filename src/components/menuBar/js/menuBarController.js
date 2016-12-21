
angular
  .module('material.components.menuBar')
  .controller('MenuBarController', MenuBarController);

var BOUND_MENU_METHODS = ['handleKeyDown', 'handleMenuHover', 'scheduleOpenHoveredMenu', 'cancelScheduledOpen'];

/**
 * @ngInject
 */
function MenuBarController($scope, $rootScope, $element, $attrs, $mdConstant, $document, $mdUtil, $timeout) {
  this.$element = $element;
  this.$attrs = $attrs;
  this.$mdConstant = $mdConstant;
  this.$mdUtil = $mdUtil;
  this.$document = $document;
  this.$scope = $scope;
  this.$rootScope = $rootScope;
  this.$timeout = $timeout;

  var self = this;
  angular.forEach(BOUND_MENU_METHODS, function(methodName) {
    self[methodName] = angular.bind(self, self[methodName]);
  });
}

MenuBarController.prototype.init = function() {
  var $element = this.$element;
  var $mdUtil = this.$mdUtil;
  var $scope = this.$scope;

  var self = this;
  var deregisterFns = [];
  $element.on('keydown', this.handleKeyDown);
  this.parentToolbar = $mdUtil.getClosest($element, 'MD-TOOLBAR');

  deregisterFns.push(this.$rootScope.$on('$mdMenuOpen', function(event, el) {
    if (self.getMenus().indexOf(el[0]) != -1) {
      $element[0].classList.add('md-open');
      el[0].classList.add('md-open');
      self.currentlyOpenMenu = el.controller('mdMenu');
      self.currentlyOpenMenu.registerContainerProxy(self.handleKeyDown);
      self.enableOpenOnHover();
    }
  }));

  deregisterFns.push(this.$rootScope.$on('$mdMenuClose', function(event, el, opts) {
    var rootMenus = self.getMenus();
    if (rootMenus.indexOf(el[0]) != -1) {
      $element[0].classList.remove('md-open');
      el[0].classList.remove('md-open');
    }

    if ($element[0].contains(el[0])) {
      var parentMenu = el[0];
      while (parentMenu && rootMenus.indexOf(parentMenu) == -1) {
        parentMenu = $mdUtil.getClosest(parentMenu, 'MD-MENU', true);
      }
      if (parentMenu) {
        if (!opts.skipFocus) parentMenu.querySelector('button:not([disabled])').focus();
        self.currentlyOpenMenu = undefined;
        self.disableOpenOnHover();
        self.setKeyboardMode(true);
      }
    }
  }));

  $scope.$on('$destroy', function() {
    self.disableOpenOnHover();
    while (deregisterFns.length) {
      deregisterFns.shift()();
    }
  });


  this.setKeyboardMode(true);
};

MenuBarController.prototype.setKeyboardMode = function(enabled) {
  if (enabled) this.$element[0].classList.add('md-keyboard-mode');
  else this.$element[0].classList.remove('md-keyboard-mode');
};

MenuBarController.prototype.enableOpenOnHover = function() {
  if (this.openOnHoverEnabled) return;

  var self = this;

  self.openOnHoverEnabled = true;

  if (self.parentToolbar) {
    self.parentToolbar.classList.add('md-has-open-menu');

    // Needs to be on the next tick so it doesn't close immediately.
    self.$mdUtil.nextTick(function() {
      angular.element(self.parentToolbar).on('click', self.handleParentClick);
    }, false);
  }

  angular
    .element(self.getMenus())
    .on('mouseenter', self.handleMenuHover);
};

MenuBarController.prototype.handleMenuHover = function(e) {
  this.setKeyboardMode(false);
  if (this.openOnHoverEnabled) {
    this.scheduleOpenHoveredMenu(e);
  }
};

MenuBarController.prototype.disableOpenOnHover = function() {
  if (!this.openOnHoverEnabled) return;

  this.openOnHoverEnabled = false;

  if (this.parentToolbar) {
    this.parentToolbar.classList.remove('md-has-open-menu');
    angular.element(this.parentToolbar).off('click', this.handleParentClick);
  }

  angular
    .element(this.getMenus())
    .off('mouseenter', this.handleMenuHover);
};

MenuBarController.prototype.scheduleOpenHoveredMenu = function(e) {
  var menuEl = angular.element(e.currentTarget);
  var menuCtrl = menuEl.controller('mdMenu');
  this.setKeyboardMode(false);
  this.scheduleOpenMenu(menuCtrl);
};

MenuBarController.prototype.scheduleOpenMenu = function(menuCtrl) {
  var self = this;
  var $timeout = this.$timeout;
  if (menuCtrl != self.currentlyOpenMenu) {
    $timeout.cancel(self.pendingMenuOpen);
    self.pendingMenuOpen = $timeout(function() {
      self.pendingMenuOpen = undefined;
      if (self.currentlyOpenMenu) {
        self.currentlyOpenMenu.close(true, { closeAll: true });
      }
      menuCtrl.open();
    }, 200, false);
  }
};

MenuBarController.prototype.handleKeyDown = function(e) {
  var keyCodes = this.$mdConstant.KEY_CODE;
  var currentMenu = this.currentlyOpenMenu;
  var wasOpen = currentMenu && currentMenu.isOpen;
  this.setKeyboardMode(true);
  var handled, newMenu, newMenuCtrl;
  switch (e.keyCode) {
    case keyCodes.DOWN_ARROW:
      if (currentMenu) {
        currentMenu.focusMenuContainer();
      } else {
        this.openFocusedMenu();
      }
      handled = true;
      break;
    case keyCodes.UP_ARROW:
      currentMenu && currentMenu.close();
      handled = true;
      break;
    case keyCodes.LEFT_ARROW:
      newMenu = this.focusMenu(-1);
      if (wasOpen) {
        newMenuCtrl = angular.element(newMenu).controller('mdMenu');
        this.scheduleOpenMenu(newMenuCtrl);
      }
      handled = true;
      break;
    case keyCodes.RIGHT_ARROW:
      newMenu = this.focusMenu(+1);
      if (wasOpen) {
        newMenuCtrl = angular.element(newMenu).controller('mdMenu');
        this.scheduleOpenMenu(newMenuCtrl);
      }
      handled = true;
      break;
  }
  if (handled) {
    e && e.preventDefault && e.preventDefault();
    e && e.stopImmediatePropagation && e.stopImmediatePropagation();
  }
};

MenuBarController.prototype.focusMenu = function(direction) {
  var menus = this.getMenus();
  var focusedIndex = this.getFocusedMenuIndex();

  if (focusedIndex == -1) { focusedIndex = this.getOpenMenuIndex(); }

  var changed = false;

  if (focusedIndex == -1) { focusedIndex = 0; changed = true; }
  else if (
    direction < 0 && focusedIndex > 0 ||
    direction > 0 && focusedIndex < menus.length - direction
  ) {
    focusedIndex += direction;
    changed = true;
  }
  if (changed) {
    menus[focusedIndex].querySelector('button').focus();
    return menus[focusedIndex];
  }
};

MenuBarController.prototype.openFocusedMenu = function() {
  var menu = this.getFocusedMenu();
  menu && angular.element(menu).controller('mdMenu').open();
};

MenuBarController.prototype.getMenus = function() {
  var $element = this.$element;
  return this.$mdUtil.nodesToArray($element[0].children)
    .filter(function(el) { return el.nodeName == 'MD-MENU'; });
};

MenuBarController.prototype.getFocusedMenu = function() {
  return this.getMenus()[this.getFocusedMenuIndex()];
};

MenuBarController.prototype.getFocusedMenuIndex = function() {
  var $mdUtil = this.$mdUtil;
  var focusedEl = $mdUtil.getClosest(
    this.$document[0].activeElement,
    'MD-MENU'
  );
  if (!focusedEl) return -1;

  var focusedIndex = this.getMenus().indexOf(focusedEl);
  return focusedIndex;
};

MenuBarController.prototype.getOpenMenuIndex = function() {
  var menus = this.getMenus();
  for (var i = 0; i < menus.length; ++i) {
    if (menus[i].classList.contains('md-open')) return i;
  }
  return -1;
};

MenuBarController.prototype.handleParentClick = function(event) {
  var openMenu = this.querySelector('md-menu.md-open');

  if (openMenu && !openMenu.contains(event.target)) {
    angular.element(openMenu).controller('mdMenu').close(true, {
      closeAll: true
    });
  }
};
