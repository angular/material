/**
 * @ngdoc module
 * @name material.components.menu-bar
 */

/**
 * @ngdoc directive
 * @name mdMenuBar
 * @module material.components.menu-bar
 * @restrict E
 * @description
 *
 * Menu bars are containers that hold multiple menus. They change the behavior and appearence
 * of the `md-menu` directive to behave similar to an operating system provided menu.
 *
 * @usage
 * <hljs lang="html">
 * <md-menu-bar>
 *   <md-menu>
 *     <button ng-click="$mdOpenMenu()">
 *       File
 *     </button>
 *     <md-menu-content>
 *       <md-menu-item>
 *         <md-button ng-click="ctrl.sampleAction('share', $event)">
 *           Share...
 *         </md-button>
 *       </md-menu-item>
 *       <md-menu-divider></md-menu-divider>
 *       <md-menu-item>
 *       <md-menu-item>
 *         <md-menu>
 *           <md-button ng-click="$mdOpenMenu()">New</md-button>
 *           <md-menu-content>
 *             <md-menu-item><md-button ng-click="ctrl.sampleAction('New Document', $event)">Document</md-button></md-menu-item>
 *             <md-menu-item><md-button ng-click="ctrl.sampleAction('New Spreadsheet', $event)">Spreadsheet</md-button></md-menu-item>
 *             <md-menu-item><md-button ng-click="ctrl.sampleAction('New Presentation', $event)">Presentation</md-button></md-menu-item>
 *             <md-menu-item><md-button ng-click="ctrl.sampleAction('New Form', $event)">Form</md-button></md-menu-item>
 *             <md-menu-item><md-button ng-click="ctrl.sampleAction('New Drawing', $event)">Drawing</md-button></md-menu-item>
 *           </md-menu-content>
 *         </md-menu>
 *       </md-menu-item>
 *     </md-menu-content>
 *   </md-menu>
 * </md-menu-bar>
 * </hljs>
 *
 * ## Menu Bar Controls
 *
 * You may place `md-menu-items` that function as controls within menu bars.
 * There are two modes that are exposed via the `type` attribute of the `md-menu-item`.
 * `type="checkbox"` will function as a boolean control for the `ng-model` attribute of the
 * `md-menu-item`. `type="radio"` will function like a radio button, setting the `ngModel`
 * to the `string` value of the `value` attribute. If you need non-string values, you can use
 * `ng-value` to provide an expression (this is similar to how angular's native `input[type=radio]` works.
 *
 * <hljs lang="html">
 * <md-menu-bar>
 *  <md-menu>
 *    <button ng-click="$mdOpenMenu()">
 *      Sample Menu
 *    </button>
 *    <md-menu-content>
 *      <md-menu-item type="checkbox" ng-model="settings.allowChanges">Allow changes</md-menu-item>
 *      <md-menu-divider></md-menu-divider>
 *      <md-menu-item type="radio" ng-model="settings.mode" ng-value="1">Mode 1</md-menu-item>
 *      <md-menu-item type="radio" ng-model="settings.mode" ng-value="1">Mode 2</md-menu-item>
 *      <md-menu-item type="radio" ng-model="settings.mode" ng-value="1">Mode 3</md-menu-item>
 *    </md-menu-content>
 *  </md-menu>
 * </md-menu-bar>
 * </hljs>
 *
 *
 * ### Nesting Menus
 *
 * Menus may be nested within menu bars. This is commonly called cascading menus.
 * To nest a menu place the nested menu inside the content of the `md-menu-item`.
 * <hljs lang="html">
 * <md-menu-item>
 *   <md-menu>
 *     <md-button ng-click="$mdOpenMenu()">New</md-button>
 *     <md-menu-content>
 *       <md-menu-item><md-button ng-click="ctrl.sampleAction('New Document', $event)">Document</md-button></md-menu-item>
 *       <md-menu-item><md-button ng-click="ctrl.sampleAction('New Spreadsheet', $event)">Spreadsheet</md-button></md-menu-item>
 *       <md-menu-item><md-button ng-click="ctrl.sampleAction('New Presentation', $event)">Presentation</md-button></md-menu-item>
 *       <md-menu-item><md-button ng-click="ctrl.sampleAction('New Form', $event)">Form</md-button></md-menu-item>
 *       <md-menu-item><md-button ng-click="ctrl.sampleAction('New Drawing', $event)">Drawing</md-button></md-menu-item>
 *     </md-menu-content>
 *   </md-menu>
 * </md-menu-item>
 * </hljs>
 *
 */

angular.module('material.components.menuBar', [
  'material.core',
  'material.components.menu'
])
.directive('mdMenuBar', MenuBarDirective)
.directive('mdMenuItem', MenuItemDirective)
.directive('mdMenuDivider', MenuDividerDirective);

var BOUND_MENU_METHODS = ['handleKeyDown', 'handleMenuHover', 'scheduleOpenHoveredMenu', 'cancelScheduledOpen'];

function MenuBarCtrl($scope, $element, $attrs, $mdConstant, $document, $mdUtil, $timeout) {
  this.$element = $element;
  this.$attrs = $attrs;
  this.$mdConstant = $mdConstant;
  this.$mdUtil = $mdUtil;
  this.$document = $document;
  this.$scope = $scope;
  this.$timeout = $timeout;

  var self = this;
  angular.forEach(BOUND_MENU_METHODS, function(methodName) {
    self[methodName] = angular.bind(self, self[methodName]);
  });
}

MenuBarCtrl.prototype.init = function() {
  var $element = this.$element;
  var $mdUtil = this.$mdUtil;
  var $scope = this.$scope;

  var self = this;
  $element.on('keydown', this.handleKeyDown);
  this.parentToolbar = $mdUtil.getClosest($element, 'MD-TOOLBAR');

  $scope.$on('$mdMenuOpen', function(event, el) {
    if (self.getMenus().indexOf(el[0]) != -1) {
      $element[0].classList.add('md-open');
      el[0].classList.add('md-open');
      self.currentlyOpenMenu = el.controller('mdMenu');
      self.currentlyOpenMenu.registerContainerProxy(self.handleKeyDown);
      self.enableOpenOnHover();
    }
  });

  $scope.$on('$mdMenuClose', function(event, el) {
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
        parentMenu.querySelector('button').focus();
        self.currentlyOpenMenu = undefined;
        self.disableOpenOnHover();
        self.setKeyboardMode(true);
      }
    }
  });

  angular.element(this.getMenus())
    .on('mouseenter', this.handleMenuHover);
  this.setKeyboardMode(true);
};

MenuBarCtrl.prototype.setKeyboardMode = function(enabled) {
  if (enabled) this.$element[0].classList.add('md-keyboard-mode');
  else this.$element[0].classList.remove('md-keyboard-mode');
};

MenuBarCtrl.prototype.enableOpenOnHover = function() {
  if (this.openOnHoverEnabled) return;
  this.openOnHoverEnabled = true;

  var $element = this.$element;

  var parentToolbar;
  if (parentToolbar = this.parentToolbar) {
    parentToolbar.dataset.mdRestoreStyle = parentToolbar.getAttribute('style');
    parentToolbar.style.position = 'relative';
    parentToolbar.style.zIndex = 100;
  }
};

MenuBarCtrl.prototype.handleMenuHover = function(e) {
  this.setKeyboardMode(false);
  if (this.openOnHoverEnabled) {
    this.scheduleOpenHoveredMenu(e);
  }
};


MenuBarCtrl.prototype.disableOpenOnHover = function() {
  if (!this.openOnHoverEnabled) return;
  this.openOnHoverEnabled = false;
  var parentToolbar;
  if (parentToolbar = this.parentToolbar) {
    parentToolbar.setAttribute('style', parentToolbar.dataset.mdRestoreStyle || '');
  }
};

MenuBarCtrl.prototype.scheduleOpenHoveredMenu = function(e) {
  var menuEl = angular.element(e.currentTarget);
  var menuCtrl = menuEl.controller('mdMenu');
  this.setKeyboardMode(false);
  this.scheduleOpenMenu(menuCtrl);
};

MenuBarCtrl.prototype.scheduleOpenMenu = function(menuCtrl) {
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
}

MenuBarCtrl.prototype.handleKeyDown = function(e) {
  var keyCodes = this.$mdConstant.KEY_CODE;
  var currentMenu = this.currentlyOpenMenu;
  var wasOpen = currentMenu && currentMenu.isOpen;
  this.setKeyboardMode(true);
  var handled;
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
      var newMenu = this.focusMenu(-1);
      if (wasOpen) {
        var newMenuCtrl = angular.element(newMenu).controller('mdMenu');
        this.scheduleOpenMenu(newMenuCtrl);
      }
      handled = true;
      break;
    case keyCodes.RIGHT_ARROW:
      var newMenu = this.focusMenu(+1);
      if (wasOpen) {
        var newMenuCtrl = angular.element(newMenu).controller('mdMenu');
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

MenuBarCtrl.prototype.focusMenu = function(direction) {
  var menus = this.getMenus();
  var focusedIndex = this.getFocusedMenuIndex();

  if (focusedIndex == -1) { focusedIndex = this.getOpenMenuIndex(); }

  var changed = false;

  if (focusedIndex == -1) { focusedIndex = 0; }
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

MenuBarCtrl.prototype.openFocusedMenu = function() {
  var menu = this.getFocusedMenu();
  menu && angular.element(menu).controller('mdMenu').open();
};

MenuBarCtrl.prototype.getMenus = function() {
  var $element = this.$element;
  return this.$mdUtil.nodesToArray($element[0].querySelectorAll(':scope > md-menu'));
};

MenuBarCtrl.prototype.getFocusedMenu = function() {
  return this.getMenus()[this.getFocusedMenuIndex()];
};

MenuBarCtrl.prototype.getFocusedMenuIndex = function() {
  var $mdUtil = this.$mdUtil;
  var $element = this.$element;
  var focusedEl = $mdUtil.getClosest(
    this.$document[0].activeElement,
    'MD-MENU'
  );
  if (!focusedEl) return -1;

  var focusedIndex = this.getMenus().indexOf(focusedEl);
  return focusedIndex;

};

MenuBarCtrl.prototype.getOpenMenuIndex = function() {
  var menus = this.getMenus();
  for (var i = 0; i < menus.length; ++i) {
    if (menus[i].classList.contains('md-open')) return i;
  }
  return -1;
};

function MenuItemDirective() {
  return {
    require: ['mdMenuItem', '?ngModel'],
    compile: function(templateEl, templateAttrs) {
      if (templateAttrs.type == 'checkbox' || templateAttrs.type == 'radio') {
        var text = templateEl[0].textContent;
        templateEl.html('');
        templateEl.append(angular.element('<md-icon md-svg-icon="check"></md-icon>'));

        var buttonEl = angular.element('<md-button type="button"></md-button>');
        buttonEl.html(text);
        buttonEl.attr('tabindex', '0');
        angular.forEach(['ng-disabled'], moveAttrToButton);

        templateEl.append(buttonEl);
        var role;
        if (templateAttrs.type == 'checkbox') {
          setDefault('role', 'menuitemcheckbox');
        } else {
          setDefault('role', 'menuitemradio');
        }
        templateEl[0].classList.add('md-indent');
      } else {
        setDefault('role', 'menuitem');
      }


      return function(scope, el, attrs, ctrls) {
        var ctrl = ctrls[0];
        var ngModel = ctrls[1];
        ctrl.init(ngModel);
      };

      function setDefault(attr, val) {
        if (!templateEl[0].hasAttribute(attr)) {
          templateEl[0].setAttribute(attr, val);
        }
      }

      function moveAttrToButton(attr) {
        if (templateEl[0].hasAttribute(attr)) {
          var val = templateEl[0].getAttribute(attr);
          buttonEl[0].setAttribute(attr, val);
          templateEl[0].removeAttribute(attr);
        }
      }
    },
    controller: MenuItemCtrl
  };
}

function MenuItemCtrl($scope, $element, $attrs) {
  this.$element = $element;
  this.$attrs = $attrs;
  this.$scope = $scope;
}

MenuItemCtrl.prototype.init = function(ngModel) {
  var $element = this.$element;
  var $attrs = this.$attrs;

  this.ngModel = ngModel;
  if ($attrs.type == 'checkbox' || $attrs.type == 'radio') {
    this.mode  = $attrs.type;
    this.iconEl = $element[0].children[0];
    this.buttonEl = $element[0].children[1];
    if (ngModel) this.initClickListeners();
  }
};

MenuItemCtrl.prototype.initClickListeners = function() {
  var ngModel = this.ngModel;
  var $scope = this.$scope;
  var $attrs = this.$attrs;
  var $element = this.$element;
  var mode = this.mode;

  this.handleClick = angular.bind(this, this.handleClick);

  var icon = this.iconEl
  var button = angular.element(this.buttonEl);
  var handleClick = this.handleClick;

  $attrs.$observe('disabled', setDisabled);
  setDisabled($attrs.disabled);

  ngModel.$render = function render() {
    if (isSelected()) {
      icon.style.display = '';
      $element.attr('aria-checked', 'true');
    } else {
      icon.style.display = 'none';
      $element.attr('aria-checked', 'false');
    }
  };

  $scope.$$postDigest(ngModel.$render);

  function isSelected() {
    if (mode == 'radio') {
      var val = $attrs.ngValue ? $scope.$eval($attrs.ngValue) : $attrs.value;
      return ngModel.$modelValue == val;
    } else {
      return ngModel.$modelValue;
    }
  }

  function setDisabled(disabled) {
    if (disabled) {
      button.off('click', handleClick);
    } else {
      button.on('click', handleClick);
    }
  }
};

MenuItemCtrl.prototype.handleClick = function(e) {
  var mode = this.mode;
  var ngModel = this.ngModel;
  var $attrs = this.$attrs;
  var newVal;
  if (mode == 'checkbox') {
    newVal = !ngModel.$modelValue;
  } else if (mode == 'radio') {
    newVal = $attrs.ngValue ? this.$scope.$eval($attrs.ngValue) : $attrs.value;
  }
  ngModel.$setViewValue(newVal);
  ngModel.$render();
};

function MenuBarDirective($mdUtil, $mdTheming) {
  return {
    restrict: 'E',
    require: 'mdMenuBar',
    controller: MenuBarCtrl,
    compile: compile
  };

  function compile(templateEl, templateAttrs) {
    if (!templateAttrs.ariaRole) {
      templateEl[0].setAttribute('role', 'menubar');
    }
    angular.forEach(templateEl[0].children, function(menuEl) {
      if (menuEl.nodeName == 'MD-MENU') {
        if (!menuEl.hasAttribute('md-position-mode')) {
          menuEl.setAttribute('md-position-mode', 'left bottom');
        }
        menuEl.setAttribute('role', 'menu');
        var contentEls = $mdUtil.nodesToArray(menuEl.querySelectorAll('md-menu-content'));
        angular.forEach(contentEls, function(contentEl) {
          contentEl.classList.add('md-menu-bar-menu');
          contentEl.classList.add('md-dense');
          if (!contentEl.hasAttribute('width')) {
            contentEl.setAttribute('width', 5);
          }
        });
      }
    });
    return link;
  }

  function link(scope, el, attrs, ctrl) {
    $mdTheming(scope, el);
    ctrl.init();
  }
}

function MenuDividerDirective() {
  return {
    restrict: 'E',
    compile: function(templateEl, templateAttrs) {
      if (!templateAttrs.role) {
        templateEl[0].setAttribute('role', 'separator');
      }
    }
  };
}
