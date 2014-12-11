(function() {
'use strict';


angular.module('material.components.tabs')
  .controller('$mdTab', TabItemController);

function TabItemController($scope, $element, $attrs, $compile, $animate, $mdUtil, $parse, $timeout) {
  var self = this;
  var tabsCtrl = $element.controller('mdTabs');

  // Properties
  self.contentContainer = angular.element('<div class="md-tab-content ng-hide">');
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
  function onAdd(contentArea, shouldDisconnectScope) {
    if (self.content.length) {
      self.contentContainer.append(self.content);
      self.contentScope = $scope.$parent.$new();
      contentArea.append(self.contentContainer);

      $compile(self.contentContainer)(self.contentScope);
      if (shouldDisconnectScope === true) {
        $timeout(function () {
          $mdUtil.disconnectScope(self.contentScope);
        }, 0, false);
      }
    }
  }

  function onRemove() {
    $animate.leave(self.contentContainer).then(function() {
      self.contentScope && self.contentScope.$destroy();
      self.contentScope = null;
    });
  }

  function toggleAnimationClass(rightToLeft) {
    self.contentContainer[rightToLeft ? 'addClass' : 'removeClass']('md-transition-rtl');
  }

  function onSelect(rightToLeft) {
    // Resume watchers and events firing when tab is selected
    $mdUtil.reconnectScope(self.contentScope);

    $element
      .addClass('active')
      .attr({
        'aria-selected': true,
        'tabIndex': 0
      })
      .on('$md.swipeleft $md.swiperight', onSwipe);

    toggleAnimationClass(rightToLeft);
    $animate.removeClass(self.contentContainer, 'ng-hide');

    $scope.onSelect();
  }

  function onDeselect(rightToLeft) {
    // Stop watchers & events from firing while tab is deselected
    $mdUtil.disconnectScope(self.contentScope);

    $element
      .removeClass('active')
      .attr({
        'aria-selected': false,
        'tabIndex': -1
      })
      .off('$md.swipeleft $md.swiperight', onSwipe);

    toggleAnimationClass(rightToLeft);
    $animate.addClass(self.contentContainer, 'ng-hide');

    $scope.onDeselect();
  }

  ///// Private functions

  function onSwipe(ev) {
    $scope.$apply(function() {
      if (/left/.test(ev.type)) {
        tabsCtrl.select(tabsCtrl.next());
      } else {
        tabsCtrl.select(tabsCtrl.previous());
      }
    });
  }
 

}

})();
