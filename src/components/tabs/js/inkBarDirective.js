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
    var nobar = ctrls[0];
    var tabsCtrl = ctrls[1];

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
        var left = (tabsCtrl.indexOf(selected) / count) + (1 / count / 2);
        element.css($mdConstant.CSS.TRANSFORM, 'scaleX(' + scale + ') ' +
                    'translate3d(' + left / scale * 100 + '%,0,0)');
      }
    }

  }

}
})();
