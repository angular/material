(function () {
  'use strict';
  angular
      .module('material.components.tabs')
      .directive('mdLabelTemplate', MdLabelTemplate);

  function MdLabelTemplate ($compile) {
    return {
      restrict: 'A',
      link: link,
      scope: { template: '=mdLabelTemplate' },
      require: '^mdTabs'
    };
    function link (scope, element, attr, ctrl) {
      var index = scope.$parent.$index;
      scope.$watch('template', function (html) {
        element.html(html);
        $compile(element.contents())(ctrl.tabs[index].parent);
      });
    }
  }
})();