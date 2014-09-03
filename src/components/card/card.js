/**
 * @ngdoc module
 * @name material.components.card
 *
 * @description
 * Card components.
 */
angular.module('material.components.card', [
])
  .directive('materialCard', [
    materialCardDirective 
  ]);



/**
 * @ngdoc directive
 * @name materialCard
 * @module material.components.card
 *
 * @restrict E
 *
 * @description
 * The `<material-card>` directive is a container element used within `<material-content>` containers.
 *
 * Cards have constant width and variable heights; where the maximum height is limited to what can
 * fit within a single view on a platform, but it can temporarily expand as needed
 *
 * @usage
 * <hljs lang="html">
 * <material-card>
 *  <img src="/img/washedout.png" class="material-card-image">
 *  <h2>Paracosm</h2>
 *  <p>
 *    The titles of Washed Out's breakthrough song and the first single from Paracosm share the * two most important words in Ernest Greene's musical language: feel it. It's a simple request, as well...
 *  </p>
 * </material-card>
 * </hljs>
 *
 */
function materialCardDirective() {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
    }
  };
}
