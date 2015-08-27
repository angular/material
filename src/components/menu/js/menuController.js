

angular
    .module('material.components.menu')
    .controller('mdMenuCtrl', MenuController);

/**
 * @ngInject
 */
function MenuController($mdMenu, $attrs, $element, $scope, $mdUtil, $timeout) {

  var menuContainer;
  var self = this;
  var triggerElement;

  this.nestLevel = parseInt($attrs.mdNestLevel, 10) || 0;

  /**
   * Called by our linking fn to provide access to the menu-content
   * element removed during link
   */
  this.init = function init(setMenuContainer, opts) {
    opts = opts || {};
    menuContainer = setMenuContainer;
    // Default element for ARIA attributes has the ngClick or ngMouseenter expression
    triggerElement = $element[0].querySelector('[ng-click],[ng-mouseenter]');

    this.isInMenuBar = opts.isInMenuBar;
    this.nestedMenus = $mdUtil.nodesToArray(menuContainer[0].querySelectorAll('.md-nested-menu'));
    this.enableHoverListener();

    menuContainer.on('$mdInterimElementRemove', function() {
      self.isOpen = false;
    });
  };

  this.enableHoverListener = function() {
    $scope.$on('$mdMenuOpen', function(event, el) {
      if (menuContainer[0].contains(el[0])) {
        self.currentlyOpenMenu = el.controller('mdMenu');
        self.isAlreadyOpening = false;
        self.currentlyOpenMenu.registerContainerProxy(self.triggerContainerProxy.bind(self));
      }
    });
    $scope.$on('$mdMenuClose', function(event, el) {
      if (menuContainer[0].contains(el[0])) {
        self.currentlyOpenMenu = undefined;
      }
    });

    var menuItems = angular.element($mdUtil.nodesToArray(menuContainer[0].querySelectorAll('md-menu-item')));

    var openMenuTimeout;
    menuItems.on('mouseenter', function(event) {
      if (self.isAlreadyOpening) return;
      var nestedMenu = (
        event.target.querySelector('md-menu')
          || $mdUtil.getClosest(event.target, 'MD-MENU')
      );
      openMenuTimeout = $timeout(function() {
        if (nestedMenu) {
          nestedMenu = angular.element(nestedMenu).controller('mdMenu');
        }

        if (self.currentlyOpenMenu && self.currentlyOpenMenu != nestedMenu) {
          var closeTo = self.nestLevel + 1;
          self.currentlyOpenMenu.close(true, { closeTo: closeTo });
        } else if (nestedMenu && !nestedMenu.isOpen && nestedMenu.open) {
          self.isAlreadyOpening = true;
          nestedMenu.open();
        }
      }, nestedMenu ? 100 : 250);
      var focusableTarget = event.currentTarget.querySelector('[tabindex]');
      focusableTarget && focusableTarget.focus();
    });
    menuItems.on('mouseleave', function(event) {
      if (openMenuTimeout) {
        $timeout.cancel(openMenuTimeout);
        openMenuTimeout = undefined;
      }
    });
  };

  /**
   * Uses the $mdMenu interim element service to open the menu contents
   */
  this.open = function openMenu(ev) {
    ev && ev.stopPropagation();
    ev && ev.preventDefault();
    if (self.isOpen) return;
    self.isOpen = true;
    triggerElement = triggerElement || (ev ? ev.target : $element[0]);
    $scope.$emit('$mdMenuOpen', $element);
    $mdMenu.show({
      scope: $scope,
      mdMenuCtrl: self,
      nestLevel: self.nestLevel,
      element: menuContainer,
      target: triggerElement,
      preserveElement: self.isInMenuBar || self.nestedMenus.length > 0,
      parent: self.isInMenuBar ? $element : 'body'
    });
  }

  // Expose a open function to the child scope for html to use
  $scope.$mdOpenMenu = this.open;

  $scope.$watch(function() { return self.isOpen; }, function(isOpen) {
    if (isOpen) {
      triggerElement.setAttribute('aria-expanded', 'true');
      $element[0].classList.add('md-open');
      angular.forEach(self.nestedMenus, function(el) {
        el.classList.remove('md-open');
      });
    } else {
      triggerElement && triggerElement.setAttribute('aria-expanded', 'false');
      $element[0].classList.remove('md-open');
    }
    $scope.$mdMenuIsOpen = self.isOpen;
  });

  this.focusMenuContainer = function focusMenuContainer() {
    var focusTarget = menuContainer[0].querySelector('[md-menu-focus-target]');
    if (!focusTarget) focusTarget = menuContainer[0].querySelector('.md-button');
    focusTarget.focus();
  };

  this.registerContainerProxy = function registerContainerProxy(handler) {
    this.containerProxy = handler;
  };

  this.triggerContainerProxy = function triggerContainerProxy(ev) {
    this.containerProxy && this.containerProxy(ev);
  };

  // Use the $mdMenu interim element service to close the menu contents
  this.close = function closeMenu(skipFocus, closeOpts) {
    if ( !self.isOpen ) return;
    self.isOpen = false;

    $scope.$emit('$mdMenuClose', $element);
    $mdMenu.hide(null, closeOpts);
    if (!skipFocus) {
      var el = self.restoreFocusTo || $element.find('button')[0];
      if (el instanceof angular.element) el = el[0];
      el.focus();
    }
  }

  /**
   * Build a nice object out of our string attribute which specifies the
   * target mode for left and top positioning
   */
  this.positionMode = function positionMode() {
    var attachment = ($attrs.mdPositionMode || 'target').split(' ');

    // If attachment is a single item, duplicate it for our second value.
    // ie. 'target' -> 'target target'
    if (attachment.length == 1) {
      attachment.push(attachment[0]);
    }

    return {
      left: attachment[0],
      top: attachment[1]
    };
  }

  /**
   * Build a nice object out of our string attribute which specifies
   * the offset of top and left in pixels.
   */
  this.offsets = function offsets() {
    var position = ($attrs.mdOffset || '0 0').split(' ').map(parseFloat);
    if (position.length == 2) {
      return {
        left: position[0],
        top: position[1]
      };
    } else if (position.length == 1) {
      return {
        top: position[0],
        left: position[0]
      };
    } else {
      throw Error('Invalid offsets specified. Please follow format <x, y> or <n>');
    }
  }
}
