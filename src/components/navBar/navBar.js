/**
 * @ngdoc module
 * @name material.components.navBar
 */


angular.module('material.components.navBar', ['material.core'])
    .controller('MdNavBarController', MdNavBarController)
    .directive('mdNavBar', MdNavBar)
    .controller('MdNavItemController', MdNavItemController)
    .directive('mdNavItem', MdNavItem);


/*****************************************************************************
 *                            PUBLIC DOCUMENTATION                           *
 *****************************************************************************/
/**
 * @ngdoc directive
 * @name mdNavBar
 * @module material.components.navBar
 *
 * @restrict E
 *
 * @description
 * The `<md-nav-bar>` directive renders a list of material tabs that can be used
 * for top-level page navigation. Unlike `<md-tabs>`, it has no concept of a tab
 * body and no bar pagination.
 *
 * Because it deals with page navigation, certain routing concepts are built-in.
 * Route changes via via ng-href, ui-sref, or ng-click events are supported.
 * Alternatively, the user could simply watch currentNavItem for changes.
 *
 * Accessibility functionality is implemented as a site navigator with a
 * listbox, according to
 * https://www.w3.org/TR/wai-aria-practices/#Site_Navigator_Tabbed_Style
 *
 * @param {string=} mdSelectedNavItem The name of the current tab; this must
 *     match the name attribute of `<md-nav-item>`
 * @param {boolean=} mdNoInkBar If set to true, the ink bar will be hidden.
 * @param {string=} navBarAriaLabel An aria-label for the nav-bar
 *
 * @usage
 * <hljs lang="html">
 *  <md-nav-bar md-selected-nav-item="currentNavItem">
 *    <md-nav-item md-nav-click="goto('page1')" name="page1">
 *      Page One
 *    </md-nav-item>
 *    <md-nav-item md-nav-href="#page2" name="page3">Page Two</md-nav-item>
 *    <md-nav-item md-nav-sref="page3" name="page2">Page Three</md-nav-item>
 *    <md-nav-item
 *      md-nav-sref="app.page4"
 *      sref-opts="{reload: true, notify: true}"
 *      name="page4">
 *      Page Four
 *    </md-nav-item>
 *  </md-nav-bar>
 *</hljs>
 * <hljs lang="js">
 * (function() {
 *   'use strict';
 *
 *    $rootScope.$on('$routeChangeSuccess', function(event, current) {
 *      $scope.currentLink = getCurrentLinkFromRoute(current);
 *    });
 * });
 * </hljs>
 */

/*****************************************************************************
 *                            mdNavItem
 *****************************************************************************/
/**
 * @ngdoc directive
 * @name mdNavItem
 * @module material.components.navBar
 *
 * @restrict E
 *
 * @description
 * `<md-nav-item>` describes a page navigation link within the `<md-nav-bar>`
 * component. It renders an md-button as the actual link.
 *
 * Exactly one of the mdNavClick, mdNavHref, mdNavSref attributes are required
 * to be specified.
 *
 * @param {Function=} mdNavClick Function which will be called when the
 *     link is clicked to change the page. Renders as an `ng-click`.
 * @param {string=} mdNavHref url to transition to when this link is clicked.
 *     Renders as an `ng-href`.
 * @param {string=} mdNavSref Ui-router state to transition to when this link is
 *     clicked. Renders as a `ui-sref`.
 * @param {!Object=} srefOpts Ui-router options that are passed to the
 *     `$state.go()` function. See the [Ui-router documentation for details]
 *     (https://ui-router.github.io/docs/latest/interfaces/transition.transitionoptions.html).
 * @param {string=} name The name of this link. Used by the nav bar to know
 *     which link is currently selected.
 * @param {string=} aria-label Adds alternative text for accessibility
 *
 * @usage
 * See `<md-nav-bar>` for usage.
 */


/*****************************************************************************
 *                                IMPLEMENTATION                             *
 *****************************************************************************/

function MdNavBar($mdAria, $mdTheming) {
  return {
    restrict: 'E',
    transclude: true,
    controller: MdNavBarController,
    controllerAs: 'ctrl',
    bindToController: true,
    scope: {
      'mdSelectedNavItem': '=?',
      'mdNoInkBar': '=?',
      'navBarAriaLabel': '@?',
    },
    template:
      '<div class="md-nav-bar">' +
        '<nav role="navigation">' +
          '<ul class="_md-nav-bar-list" ng-transclude role="listbox"' +
            'tabindex="0"' +
            'ng-focus="ctrl.onFocus()"' +
            'ng-keydown="ctrl.onKeydown($event)"' +
            'aria-label="{{ctrl.navBarAriaLabel}}">' +
          '</ul>' +
        '</nav>' +
        '<md-nav-ink-bar ng-hide="ctrl.mdNoInkBar"></md-nav-ink-bar>' +
      '</div>',
    link: function(scope, element, attrs, ctrl) {
      $mdTheming(element);
      if (!ctrl.navBarAriaLabel) {
        $mdAria.expectAsync(element, 'aria-label', angular.noop);
      }
    },
  };
}

/**
 * Controller for the nav-bar component.
 *
 * Accessibility functionality is implemented as a site navigator with a
 * listbox, according to
 * https://www.w3.org/TR/wai-aria-practices/#Site_Navigator_Tabbed_Style
 * @param {!angular.JQLite} $element
 * @param {!angular.Scope} $scope
 * @param {!angular.Timeout} $timeout
 * @param {!Object} $mdConstant
 * @constructor
 * @final
 * @ngInject
 */
function MdNavBarController($element, $scope, $timeout, $mdConstant) {
  // Injected variables
  /** @private @const {!angular.Timeout} */
  this._$timeout = $timeout;

  /** @private @const {!angular.Scope} */
  this._$scope = $scope;

  /** @private @const {!Object} */
  this._$mdConstant = $mdConstant;

  // Data-bound variables.
  /** @type {string} */
  this.mdSelectedNavItem;

  /** @type {string} */
  this.navBarAriaLabel;

  // State variables.

  /** @type {?angular.JQLite} */
  this._navBarEl = $element[0];

  /** @type {?angular.JQLite} */
  this._inkbar;

  var self = this;
  // need to wait for transcluded content to be available
  var deregisterTabWatch = this._$scope.$watch(function() {
    return self._navBarEl.querySelectorAll('._md-nav-button').length;
  },
  function(newLength) {
    if (newLength > 0) {
      self._initTabs();
      deregisterTabWatch();
    }
  });
}



/**
 * Initializes the tab components once they exist.
 * @private
 */
MdNavBarController.prototype._initTabs = function() {
  this._inkbar = angular.element(this._navBarEl.querySelector('md-nav-ink-bar'));

  var self = this;
  this._$timeout(function() {
    self._updateTabs(self.mdSelectedNavItem, undefined);
  });

  this._$scope.$watch('ctrl.mdSelectedNavItem', function(newValue, oldValue) {
    // Wait a digest before update tabs for products doing
    // anything dynamic in the template.
    self._$timeout(function() {
      self._updateTabs(newValue, oldValue);
    });
  });
};

/**
 * Set the current tab to be selected.
 * @param {string|undefined} newValue New current tab name.
 * @param {string|undefined} oldValue Previous tab name.
 * @private
 */
MdNavBarController.prototype._updateTabs = function(newValue, oldValue) {
  var self = this;
  var tabs = this._getTabs();

  // this._getTabs can return null if nav-bar has not yet been initialized
  if(!tabs)
    return;

  var oldIndex = -1;
  var newIndex = -1;
  var newTab = this._getTabByName(newValue);
  var oldTab = this._getTabByName(oldValue);

  if (oldTab) {
    oldTab.setSelected(false);
    oldIndex = tabs.indexOf(oldTab);
  }

  if (newTab) {
    newTab.setSelected(true);
    newIndex = tabs.indexOf(newTab);
  }

  this._$timeout(function() {
    self._updateInkBarStyles(newTab, newIndex, oldIndex);
  });
};

/**
 * Repositions the ink bar to the selected tab.
 * @private
 */
MdNavBarController.prototype._updateInkBarStyles = function(tab, newIndex, oldIndex) {
  this._inkbar.toggleClass('_md-left', newIndex < oldIndex)
      .toggleClass('_md-right', newIndex > oldIndex);

  this._inkbar.css({display: newIndex < 0 ? 'none' : ''});

  if (tab) {
    var tabEl = tab.getButtonEl();
    var left = tabEl.offsetLeft;

    this._inkbar.css({left: left + 'px', width: tabEl.offsetWidth + 'px'});
  }
};

/**
 * Returns an array of the current tabs.
 * @return {!Array<!NavItemController>}
 * @private
 */
MdNavBarController.prototype._getTabs = function() {
  var controllers = Array.prototype.slice.call(
    this._navBarEl.querySelectorAll('.md-nav-item'))
    .map(function(el) {
      return angular.element(el).controller('mdNavItem')
    });
  return controllers.indexOf(undefined) ? controllers : null;
};

/**
 * Returns the tab with the specified name.
 * @param {string} name The name of the tab, found in its name attribute.
 * @return {!NavItemController|undefined}
 * @private
 */
MdNavBarController.prototype._getTabByName = function(name) {
  return this._findTab(function(tab) {
    return tab.getName() == name;
  });
};

/**
 * Returns the selected tab.
 * @return {!NavItemController|undefined}
 * @private
 */
MdNavBarController.prototype._getSelectedTab = function() {
  return this._findTab(function(tab) {
    return tab.isSelected();
  });
};

/**
 * Returns the focused tab.
 * @return {!NavItemController|undefined}
 */
MdNavBarController.prototype.getFocusedTab = function() {
  return this._findTab(function(tab) {
    return tab.hasFocus();
  });
};

/**
 * Find a tab that matches the specified function.
 * @private
 */
MdNavBarController.prototype._findTab = function(fn) {
  var tabs = this._getTabs();
  for (var i = 0; i < tabs.length; i++) {
    if (fn(tabs[i])) {
      return tabs[i];
    }
  }

  return null;
};

/**
 * Direct focus to the selected tab when focus enters the nav bar.
 */
MdNavBarController.prototype.onFocus = function() {
  var tab = this._getSelectedTab();
  if (tab) {
    tab.setFocused(true);
  }
};

/**
 * Move focus from oldTab to newTab.
 * @param {!NavItemController} oldTab
 * @param {!NavItemController} newTab
 * @private
 */
MdNavBarController.prototype._moveFocus = function(oldTab, newTab) {
  oldTab.setFocused(false);
  newTab.setFocused(true);
};

/**
 * Responds to keypress events.
 * @param {!Event} e
 */
MdNavBarController.prototype.onKeydown = function(e) {
  var keyCodes = this._$mdConstant.KEY_CODE;
  var tabs = this._getTabs();
  var focusedTab = this.getFocusedTab();
  if (!focusedTab) return;

  var focusedTabIndex = tabs.indexOf(focusedTab);

  // use arrow keys to navigate between tabs
  switch (e.keyCode) {
    case keyCodes.UP_ARROW:
    case keyCodes.LEFT_ARROW:
      if (focusedTabIndex > 0) {
        this._moveFocus(focusedTab, tabs[focusedTabIndex - 1]);
      }
      break;
    case keyCodes.DOWN_ARROW:
    case keyCodes.RIGHT_ARROW:
      if (focusedTabIndex < tabs.length - 1) {
        this._moveFocus(focusedTab, tabs[focusedTabIndex + 1]);
      }
      break;
    case keyCodes.SPACE:
    case keyCodes.ENTER:
      // timeout to avoid a "digest already in progress" console error
      this._$timeout(function() {
        focusedTab.getButtonEl().click();
      });
      break;
  }
};

/**
 * @ngInject
 */
function MdNavItem($mdAria, $$rAF) {
  return {
    restrict: 'E',
    require: ['mdNavItem', '^mdNavBar'],
    controller: MdNavItemController,
    bindToController: true,
    controllerAs: 'ctrl',
    replace: true,
    transclude: true,
    template: function(tElement, tAttrs) {
      var hasNavClick = tAttrs.mdNavClick;
      var hasNavHref = tAttrs.mdNavHref;
      var hasNavSref = tAttrs.mdNavSref;
      var hasSrefOpts = tAttrs.srefOpts;
      var navigationAttribute;
      var navigationOptions;
      var buttonTemplate;

      // Cannot specify more than one nav attribute
      if ((hasNavClick ? 1:0) + (hasNavHref ? 1:0) + (hasNavSref ? 1:0) > 1) {
        throw Error(
          'Must not specify more than one of the md-nav-click, md-nav-href, ' +
          'or md-nav-sref attributes per nav-item directive.'
        );
      }

      if (hasNavClick) {
        navigationAttribute = 'ng-click="ctrl.mdNavClick()"';
      } else if (hasNavHref) {
        navigationAttribute = 'ng-href="{{ctrl.mdNavHref}}"';
      } else if (hasNavSref) {
        navigationAttribute = 'ui-sref="{{ctrl.mdNavSref}}"';
      }

      navigationOptions = hasSrefOpts ? 'ui-sref-opts="{{ctrl.srefOpts}}" ' : '';

      if (navigationAttribute) {
        buttonTemplate = '' +
          '<md-button class="_md-nav-button md-accent" ' +
            'ng-class="ctrl.getNgClassMap()" ' +
            'ng-blur="ctrl.setFocused(false)" ' +
            'tabindex="-1" ' +
            navigationOptions +
            navigationAttribute + '>' +
            '<span ng-transclude class="_md-nav-button-text"></span>' +
          '</md-button>';
      }

      return '' +
        '<li class="md-nav-item" ' +
          'role="option" ' +
          'aria-selected="{{ctrl.isSelected()}}">' +
          (buttonTemplate || '') +
        '</li>';
    },
    scope: {
      'mdNavClick': '&?',
      'mdNavHref': '@?',
      'mdNavSref': '@?',
      'srefOpts': '=?',
      'name': '@',
    },
    link: function(scope, element, attrs, controllers) {
      // When accessing the element's contents synchronously, they
      // may not be defined yet because of transclusion. There is a higher
      // chance that it will be accessible if we wait one frame.
      $$rAF(function() {
        var mdNavItem = controllers[0];
        var mdNavBar = controllers[1];
        var navButton = angular.element(element[0].querySelector('._md-nav-button'));

        if (!mdNavItem.name) {
          mdNavItem.name = angular.element(element[0]
              .querySelector('._md-nav-button-text')).text().trim();
        }

        navButton.on('click', function() {
          mdNavBar.mdSelectedNavItem = mdNavItem.name;
          scope.$apply();
        });

        $mdAria.expectWithText(element, 'aria-label');
      });
    }
  };
}

/**
 * Controller for the nav-item component.
 * @param {!angular.JQLite} $element
 * @constructor
 * @final
 * @ngInject
 */
function MdNavItemController($element) {

  /** @private @const {!angular.JQLite} */
  this._$element = $element;

  // Data-bound variables

  /** @const {?Function} */
  this.mdNavClick;

  /** @const {?string} */
  this.mdNavHref;

  /** @const {?string} */
  this.mdNavSref;
  /** @const {?Object} */
  this.srefOpts;
  /** @const {?string} */
  this.name;

  // State variables
  /** @private {boolean} */
  this._selected = false;

  /** @private {boolean} */
  this._focused = false;
}

/**
 * Returns a map of class names and values for use by ng-class.
 * @return {!Object<string,boolean>}
 */
MdNavItemController.prototype.getNgClassMap = function() {
  return {
    'md-active': this._selected,
    'md-primary': this._selected,
    'md-unselected': !this._selected,
    'md-focused': this._focused,
  };
};

/**
 * Get the name attribute of the tab.
 * @return {string}
 */
MdNavItemController.prototype.getName = function() {
  return this.name;
};

/**
 * Get the button element associated with the tab.
 * @return {!Element}
 */
MdNavItemController.prototype.getButtonEl = function() {
  return this._$element[0].querySelector('._md-nav-button');
};

/**
 * Set the selected state of the tab.
 * @param {boolean} isSelected
 */
MdNavItemController.prototype.setSelected = function(isSelected) {
  this._selected = isSelected;
};

/**
 * @return {boolean}
 */
MdNavItemController.prototype.isSelected = function() {
  return this._selected;
};

/**
 * Set the focused state of the tab.
 * @param {boolean} isFocused
 */
MdNavItemController.prototype.setFocused = function(isFocused) {
  this._focused = isFocused;

  if (isFocused) {
    this.getButtonEl().focus();
  }
};

/**
 * @return {boolean}
 */
MdNavItemController.prototype.hasFocus = function() {
  return this._focused;
};
