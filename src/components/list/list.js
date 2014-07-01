angular.module('material.components.list', [])

.directive('materialList', [materialListDirective])
.directive('materialItem', [materialItemDirective]);

/**
 * @ngdoc directive
 * @name material.components.list.directive:material-list
 * @restrict E
 *
 * @description
 * materialList is a list container for material-items
 * @example
 * <material-list>
    <material-item>
      <div class="material-tile-left">
      </div>
      <div class="material-tile-content">
        <h2>Title</h2>
        <h3>Subtitle</h3>
        <p>
          Content
        </p>
      </div>
      <div class="material-tile-right">
      </div>
    </material-item>
 * </material-list>
 */
function materialListDirective() {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
    }
  }
}

/**
 * @ngdoc directive
 * @name material.components.list.directive:material-item
 * @restrict E
 *
 * @description
 * materialItem is a list item
 */
function materialItemDirective() {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
    }
  }
}
