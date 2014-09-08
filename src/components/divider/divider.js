/**
 * @ngdoc module
 * @name material.components.divider
 * @description Divider module!
 */
angular.module('material.components.divider', [
  'material.animations',
  'material.services.aria'
])
  .directive('materialDivider', MaterialDividerDirective);

function MaterialDividerController(){}

/**
 * @ngdoc directive
 * @name materialDivider
 * @module material.components.divider
 * @restrict E
 *
 * @description
 * Dividers group and separate content within lists and page layouts using strong visual and spatial distinctions. This divider is a thin rule, lightweight enough to not distract the user from content.
 *
 * @param {boolean=} inset Add this attribute to activate the inset divider style.
 * @usage
 * <hljs lang="html">
 * <material-divider></material-divider>
 *
 * <material-divider inset></material-divider>
 * </hljs>
 *
 */
function MaterialDividerDirective() {
  return {
    restrict: 'E',
    controller: [MaterialDividerController]
  };
}
