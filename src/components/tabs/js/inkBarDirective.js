/**
 * Conditionally configure ink bar animations when the
 * tab selection changes. If `nobar` then do not show the
 * bar nor animate.
 */
angular.module('material.components.tabs')

.directive('mdTabsInkBar', [
  '$mdEffects',
  '$window',
  '$$rAF',
  '$timeout',
  MdTabInkDirective
]);

function MdTabInkDirective($mdEffects, $window, $$rAF, $timeout) {

  return {
    restrict: 'E',
    require: ['^?nobar', '^mdTabs'],
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {
    var nobar = ctrls[0];
    var tabsCtrl = ctrls[1];

    if (nobar) return;

    var debouncedUpdateBar = $$rAF.debounce(updateBar);

    scope.$watch(tabsCtrl.selected, updateBar);
    scope.$on('$mdTabsChanged', debouncedUpdateBar);
    scope.$on('$mdTabsPaginationChanged', debouncedUpdateBar);
    angular.element($window).on('resize', onWindowResize);

    function onWindowResize() {
      debouncedUpdateBar();
      $timeout(debouncedUpdateBar, 100, false);
    }

    scope.$on('$destroy', function() {
      angular.element($window).off('resize', onWindowResize);
    });

    function updateBar() {
      var selectedElement = tabsCtrl.selected() && tabsCtrl.selected().element;

      if (!selectedElement || tabsCtrl.count() < 2) {
        element.css({
          display : 'none',
          width : '0px'
        });
      } else {
        var width = selectedElement.prop('offsetWidth');
        var left = selectedElement.prop('offsetLeft') + (tabsCtrl.$$pagingOffset || 0);

        element.css({
          display : width > 0 ? 'block' : 'none',
          width: width + 'px'
        });
        element.css($mdEffects.TRANSFORM, 'translate3d(' + left + 'px,0,0)');
      }
    }

  }

}
