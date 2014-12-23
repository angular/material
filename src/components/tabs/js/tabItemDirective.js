(function () {
  'use strict';

  angular
      .module('material.components.tabs')
      .directive('mdTabItem', MdTabItem);

  function MdTabItem () {
    return { require: '^mdTabs', link: link };
    function link (scope, element, attr, ctrl) {
      ctrl.attachRipple(scope, element);
    }
  }
})();