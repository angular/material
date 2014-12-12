(function() {
'use strict';

/**
 * @ngdoc module
 * @name material.components.gridlist
 */
angular.module('material.components.gridlist', ['material.core'])
       .directive('mdGridlist', GridlistDirective);

/**
 * @ngdoc directive
 * @name mdGridlist
 * @module material.components.gridlist
 * @restrict E
 * @description
 *
 * @usage
 *
 */
function GridlistDirective() {
  return {
    scope: {},
    require: [],
    controller: GridlistController,
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {

  }
}

/**
 * We use a controller for all the logic so that we can expose a few
 * things to unit tests
 */
function GridlistController($scope, $element, $attrs, $mdAria, $mdUtil, $mdConstant) {

}

})();
