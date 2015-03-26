(function() {
'use strict';

/**
 * Conditionally configure ink bar animations when the
 * tab selection changes. If `mdNoBar` then do not show the
 * bar nor animate.
 */
angular.module('material.components.tabs')
  .directive('mdTabsInkBar', MdTabInkDirective);

function MdTabInkDirective($$rAF, $mdBiDirectional) {

  var lastIndex = 0;

  return {
    restrict: 'E',
    require: ['^?mdNoBar', '^mdTabs'],
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {
    var mdNoBar = !!ctrls[0];

    var tabsCtrl = ctrls[1],
        debouncedUpdateBar = $$rAF.throttle(updateBar);

    tabsCtrl.inkBarElement = element;

    scope.$on('$mdTabsPaginationChanged', debouncedUpdateBar);

    function updateBar() {
      var selected = tabsCtrl.getSelectedItem();
      var hideInkBar = !selected || tabsCtrl.count() < 2 || mdNoBar;

      element.css('display', hideInkBar ? 'none' : 'block');

      if (hideInkBar) return;

      if (scope.pagination && scope.pagination.tabData) {
        var index = tabsCtrl.getSelectedIndex();
        var data = scope.pagination.tabData.tabs[index] || { left: 0, right: 0, width: 0 };
        var classNames = ['md-transition-left', 'md-transition-right', 'md-no-transition'];
        var classIndex = lastIndex > index ? 0 : lastIndex < index ? 1 : 2;
        var to;

        if($mdBiDirectional.isLTR()) {
          to = {
            left: data.left + 'px',
            right: (element.parent().prop('offsetWidth') - data.right) + 'px'
          };
        } else {
          to = {
            left: (element.parent().prop('offsetWidth') - data.right) + 'px',
            right: data.left + 'px'
          };
        }

        element
            .removeClass(classNames.join(' '))
            .addClass(classNames[classIndex])
            .css(to);

        lastIndex = index;
      }
    }
  }
}
})();
