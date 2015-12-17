
angular
  .module('material.components.menuBar')
  .directive('mdMenuDivider', MenuDividerDirective);


function MenuDividerDirective() {
  return {
    restrict: 'E',
    compile: function(templateEl, templateAttrs) {
      if (!templateAttrs.role) {
        templateEl[0].setAttribute('role', 'separator');
      }
    }
  };
}
