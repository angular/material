(function() {
'use strict';

/**
 * @ngdoc module
 * @name material.components._name_list
 */
angular.module('material.components._name_list', ['material.core'])
       .directive('md_name_list', _name_listDirective);

/**
 * @ngdoc directive
 * @name md_name_list
 * @module material.components._name_list
 * @restrict E
 * @description
 *
 * @usage
 *
 */
function _name_listDirective() {
  return {
    scope: {},
    require: [],
    controller: _name_listController,
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {

  }
}

/**
 * We use a controller for all the logic so that we can expose a few
 * things to unit tests
 */
function _name_listController($scope, $element, $attrs, $mdAria, $mdUtil, $mdConstant) {

}

})();
