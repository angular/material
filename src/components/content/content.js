/**
 * @ngdoc module
 * @name material.components.content
 *
 * @description
 * Scrollable content
 */
angular.module('material.components.content', [
  'material.services.theming',
  'material.services.registry'
])
  .directive('mdContent', [
    '$mdTheming',
    mdContentDirective
  ]);

/**
 * @ngdoc directive
 * @name mdContent
 * @module material.components.content
 *
 * @restrict E
 *
 * @description
 * The `<md-content>` directive is a container element useful for scrollable content
 *
 * @usage
 * <hljs lang="html">
 *  <md-content class="md-content-padding">
 *      Lorem ipsum dolor sit amet, ne quod novum mei.
 *  </md-content>
 * </hljs>
 *
 */
function mdContentDirective($mdTheming) {
  return {
    restrict: 'E',
    controller: ['$scope', '$element', ContentController],
    link: function($scope, $element, $attr) {
      $mdTheming($element);
      $scope.$broadcast('$mdContentLoaded', $element);
    }
  };

  function ContentController($scope, $element) {
    this.$scope = $scope;
    this.$element = $element;
  }
}
