(function() {
'use strict';

/**
 * Conditionally configure ink bar animations when the
 * tab selection changes. If `mdNoBar` then do not show the
 * bar nor animate.
 */
angular.module('material.components.tabs')
  .directive('mdTabsInkBar', MdTabInkDirective);

function MdTabInkDirective($mdConstant, $window, $$rAF, $timeout) {

  return {
    restrict: 'E',
    require: ['^?mdNoBar', '^mdTabs'],
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {
    var nobar = ctrls[0],
        tabsCtrl = ctrls[1],
        timeout;

    if (nobar) return;

    scope.$watch(tabsCtrl.selected, updateBar);
    scope.$on('$mdTabsChanged', updateBar);

    function updateBar() {
      var selected = tabsCtrl.selected();

      var hideInkBar = !selected || tabsCtrl.count() < 2 || 
        (scope.pagination && scope.pagination.itemsPerPage === 1);
      element.css('display', hideInkBar ? 'none' : 'block');

      if (!hideInkBar) { 
        var count = tabsCtrl.count();
        var scale = 1 / count;
        var left = tabsCtrl.indexOf(selected);
        element.addClass('md-ink-bar-grow');
        element.css({
          width: Math.round(scale * 100) + '%',
          left:  (left / scale) + '%'
        });
        if (timeout) $timeout.cancel(timeout);
        timeout = $timeout(function () {
          element.removeClass('md-ink-bar-grow');
        }, 250, false);
      }
    }

  }

}
})();
