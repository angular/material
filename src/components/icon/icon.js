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
 *  <md-icon icon="icon-error"></md-icon>
 * </hljs>
 *
 */
function mdIconDirective() {
  return {
    scope: {
      icon: '@'
    },
    restrict: 'E',
    template: '<div ng-class="icon"></div>',
    compile: function(element, attr) {
      // var object = angular.element(element[0].children[0]);
      // if(angular.isDefined(attr.icon)) {
      //   object.attr('data', attr.icon);
      // }
    }
  };
}

function MdIconProvider($$interimElementProvider) {

}
})();
