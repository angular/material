/**
 * @ngdoc module
 * @name material.components.icon
 * @description
 * Icon
 */
angular.module('material.components.icon', [])
  .directive('materialIcon', [
    materialIconDirective
  ]);

/**
 * @ngdoc directive
 * @name materialIcon
 * @module material.components.icon
 *
 * @restrict E
 *
 * @description
 * The `<material-icon>` directive is an element useful for SVG icons
 *
 * @usage
 * <hljs lang="html">
 *  <material-icon icon="/img/icons/ic_access_time_24px.svg">
 *  </material-icon>
 * </hljs>
 *
 */
function materialIconDirective() {
  return {
    restrict: 'E',
    template: '<object class="material-icon"></object>',
    compile: function(element, attr) {
      var object = angular.element(element[0].children[0]);
      if(angular.isDefined(attr.icon)) {
        object.attr('data', attr.icon);
      }
    }
  };
}
