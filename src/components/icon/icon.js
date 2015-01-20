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
  .directive('mdIcon', mdIconDirective)
  .provider('$mdIcon', MdIconProvider);

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
function mdIconDirective($mdIcon) {
  return {
    scope: {
      mdIconKey: '@',
      mdIconSize: '@',
      mdIconColor: '@'
    },
    restrict: 'E',
    replace: true,
    template: '<span class="icon"></span>',
    link: function(scope, element, attr) {
      if ($mdIcon[scope.mdIConKey]) {
        // TODO: use from config.
      } else {
        element.append(angular.element('<i>').addClass(scope.mdIconKey));
      }
      if(angular.isDefined(attr.mdIconKey)) {
        element.css('font-size', scope.mdIconSize);
      }
      attr.$observe('mdIconColor', function(color) {
        if(color) {
          element.css('color', scope.mdIconColor);
        }
      }, true);
    }
  };
}

function MdIconProvider() {
  this.config;

  this.$get = function() {
    return this.config || {};
  };

  this.registerIcon = function(name, expr) {
    this.config[name] = expr;
  }

  this.registerIconSet = function(name, expr) {
    
  }
}
})();
