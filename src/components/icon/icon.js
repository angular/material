(function() {
'use strict';

/*
 * @ngdoc module
 * @name material.components.icon
 * @description
 * Icon
 */
angular.module('material.components.icon', [
  'material.core'
])
  .directive('mdIcon', mdIconDirective);
  // .provider('$mdIcon', MdIconProvider);

/*
 * @ngdoc directive
 * @name mdIcon
 * @module material.components.icon
 *
 * @restrict E
 *
 * @description
 * The `<md-icon>` directive is an element useful for showing an icon
 *
 * @usage
 * <hljs lang="html">
 *  <md-icon md-icon-key="icon-android" md-icon-size=""></md-icon>
 * </hljs>
 *
 */
function mdIconDirective() {
  return {
    scope: {
      mdIconKey: '@',
      mdIconSize: '@'
    },
    restrict: 'E',
    replace: true,
    template: '<span class="step size-{{ mdIconSize }}">' +
                '<i class="{{ mdIconKey }}"></i>' +
              '</span>'
  };
}

function MdIconProvider($$interimElementProvider) {

}
})();
