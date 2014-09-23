
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
  self.contentContainer = angular.element('<div class="tab-content ng-hide">');
  self.element = element;

  // Methods
  self.isDisabled = isDisabled;
  self.onAdd = onAdd;
  self.onRemove = onRemove;
  self.onSelect = onSelect;
  self.onDeselect = onDeselect;

  function isDisabled() {
    return element[0].hasAttribute('disabled');
  }
  
  /**
   * Add the tab's content to the DOM container area in the tabs,
   * @param contentArea the contentArea to add the content of the tab to
   */
  function onAdd(contentArea) {
    if (self.content.length) {

      self.contentContainer.append(self.content);
      self.contentScope = scope.$parent.$new();
      contentArea.append(self.contentContainer);

      $compile(self.contentContainer)(self.contentScope);
      Util.disconnectScope(self.contentScope);
    }
  }

  function onRemove() {
    $animate.leave(self.contentContainer).then(function() {
      self.contentScope && self.contentScope.$destroy();
      self.contentScope = null;
    });
  }

  function onSelect() {
    // Resume watchers and events firing when tab is selected
    Util.reconnectScope(self.contentScope);

    element.addClass('active');
    element.attr('aria-selected', true);
    element.attr('tabIndex', 0);
    $animate.removeClass(self.contentContainer, 'ng-hide');

    scope.onSelect();
  }

  function onDeselect() {
    // Stop watchers & events from firing while tab is deselected
    Util.disconnectScope(self.contentScope);

    element.removeClass('active');
    element.attr('aria-selected', false);
    // Only allow tabbing to the active tab
    element.attr('tabIndex', -1);
    $animate.addClass(self.contentContainer, 'ng-hide');

    scope.onDeselect();
  }

}

