angular.module('material.components.icon', [])
  .directive('materialIcon', [ materialIconDirective ]);

function materialIconDirective() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<object class="material-icon"></object>',
    compile: function(element, attr) {
      var object = angular.element(element[0].children[0]);
      if(angular.isDefined(attr.icon)) {
        object.attr('data', attr.icon);
      }
    }
  };
}
