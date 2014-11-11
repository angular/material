(function() {
'use strict';


angular.module('material.components.tabs')
  .controller('$mdTab', TabItemController);

function TabItemController($scope, $element, $attrs, $compile, $animate, $mdUtil, $parse) {
  var self = this;

  // Properties
  self.contentContainer = angular.element('<div class="md-tab-content ng-hide">');
  self.hammertime = new Hammer(self.contentContainer[0]);
  self.element = $element;

  // Methods
  self.isDisabled = isDisabled;
  self.onAdd = onAdd;
  self.onRemove = onRemove;
  self.onSelect = onSelect;
  self.onDeselect = onDeselect;

  var disabledParsed = $parse($attrs.ngDisabled);
  function isDisabled() {
    return disabledParsed($scope.$parent);
  }
  
  /**
   * Add the tab's content to the DOM container area in the tabs,
   * @param contentArea the contentArea to add the content of the tab to
   */
  function onAdd(contentArea) {
    if (self.content.length) {
      self.contentContainer.append(self.content);
      self.contentScope = $scope.$parent.$new();
      contentArea.append(self.contentContainer);

      $compile(self.contentContainer)(self.contentScope);
      $mdUtil.disconnectScope(self.contentScope);
    }
  }

  function onRemove() {
    self.hammertime.destroy();
    $animate.leave(self.contentContainer).then(function() {
      self.contentScope && self.contentScope.$destroy();
      self.contentScope = null;
    });
  }

  function onSelect() {
    // Resume watchers and events firing when tab is selected
    $mdUtil.reconnectScope(self.contentScope);
    self.hammertime.on('swipeleft swiperight', $scope.onSwipe);

    $element.addClass('active');
    $element.attr('aria-selected', true);
    $element.attr('tabIndex', 0);
    $animate.removeClass(self.contentContainer, 'ng-hide');

    $scope.onSelect();
  }

  function onDeselect() {
    // Stop watchers & events from firing while tab is deselected
    $mdUtil.disconnectScope(self.contentScope);
    self.hammertime.off('swipeleft swiperight', $scope.onSwipe);

    $element.removeClass('active');
    $element.attr('aria-selected', false);
    // Only allow tabbing to the active tab
    $element.attr('tabIndex', -1);
    $animate.addClass(self.contentContainer, 'ng-hide');

    $scope.onDeselect();
  }

}

})();
