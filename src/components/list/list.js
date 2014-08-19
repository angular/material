/**
 * @ngdoc module
 * @name material.components.list
 * @description
 * List module
 */
angular.module('material.components.list', [])

.directive('materialList', [
  materialListDirective
])
.directive('materialItem', [
  materialItemDirective
]);

/**
 * @ngdoc directive
 * @name materialList
 * @module material.components.list
 *
 * @private
 * @restrict E
 *
 * @description
 * The `<material-list>` directive is a list container for 1..n `<material-item>` tags.
 * While this directive does not provide any programmatic features, the element
 * participates in the Angular Material **layout** style features.
 *
 * @usage
 * <hljs lang="html">
 * <material-list>
 *  <material-item ng-repeat="item in todos">
 *
 *    <div class="material-tile-content">
 *      <h2>{{item.what}}</h2>
 *      <h3>{{item.who}}</h3>
 *      <p>
 *        {{item.notes}}
 *      </p>
 *    </div>
 *
 *  </material-item>
 * </material-list>
 * </hljs>
 *
 */
function materialListDirective() {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
    }
  };
}

/**
 * @ngdoc directive
 * @name materialItem
 * @module material.components.list
 *
 * @private
 * @restrict E
 *
 * @description
 * The `<material-item>` directive provides a stylable element that
 * participates in the Angular Material **layout** style features.
 *
 * @usage
 * <hljs lang="html">
 *
 *  <material-item>
 *
 *  </material-item>
 * </hljs>
 *
 */
function materialItemDirective() {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
    }
  };
}
