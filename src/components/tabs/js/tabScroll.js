(function () {
  'use strict';
  angular.module('material.components.tabs')
      .directive('mdTabScroll', MdTabScroll);

  function MdTabScroll () {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        element.on('mousewheel', function (event) {
          var newScope = scope.$new();
          newScope.$event = event;
          newScope.$element = element;
          newScope.$apply(function () {
            newScope.$eval(attr.mdTabScroll);
          });
        });
      }

    }
  }
})();