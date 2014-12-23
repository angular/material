(function () {
  'use strict';
  angular
      .module('material.components.tabs')
      .directive('mdTabContent', MdTabContent);

  function MdTabContent ($compile, $mdUtil) {
    return {
      terminal: true,
      scope: {
        tab: '=mdTabData',
        active: '=mdActive'
      },
      link: link
    };
    function link (scope, element) {
      element.html(scope.tab.template);
      $compile(element.contents())(scope.tab.parent);
    }
  }
})();
