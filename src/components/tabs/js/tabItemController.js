
angular.module('material.components.tabs')

.controller('$materialTab', [
  '$scope',
  '$element',
  '$compile',
  '$animate',
  TabItemController
]);

function TabItemController(scope, element, $compile, $animate) {
  var self = this;

  // Properties
  self.contentParent = angular.element('<div class="tab-content ng-hide">');
  self.element = element;

  // Methods
  self.isDisabled = isDisabled;
  self.onSelect = onSelect;
  self.onDeselect = onDeselect;
  self.setupContent = setupContent;

  function isDisabled() {
    return element[0].hasAttribute('disabled');
  }

  function onSelect() {
    // Resume watchers and events firing when tab is selected
    Util.reconnectScope(self.contentScope);

    element.addClass('active');
    element.attr('aria-selected', true);
    element.attr('tabIndex', 0);
    $animate.removeClass(self.contentParent, 'ng-hide');

    scope.onSelect();
  }

  function onDeselect() {
    // Stop watchers & events from firing while tab is deselected
    Util.disconnectScope(self.contentScope);

    element.removeClass('active');
    element.attr('aria-selected', false);
    // Only allow tabbing to the active tab
    element.attr('tabIndex', -1);
    $animate.addClass(self.contentParent, 'ng-hide');

    scope.onDeselect();
  }

  // Called when the tab is added, from tabsCtrl.
  // Add the tab's content to the proper area in the tabs,
  // and do initial setup.
  function setupContent(contentArea) {
    if (setupContent.called) return; // Only do this once.
    setupContent.called = true;

    // If there isn't any content for this tab, don't setup anything.
    if (self.content.length) {

      self.contentParent.append(self.content);
      self.contentScope = self.content.children().scope();
      contentArea.append(self.contentParent);

      Util.disconnectScope(self.contentScope);

    }
  }
}

