/**
 * @ngdoc module
 * @name material.components.sticky
 * @description
 *
 * Sticky effects for material
 */

angular.module('material.components.sticky', [])
.factory('$materialSticky', [MaterialSticky]);
/**
 * @ngdoc factory
 * @name $materialSticky
 * @module material.components.sticky
 *
 * @description
 * The `$materialSticky`service provides a mixin to make elements sticky.
 *
 * @returns A `$materialSticky` function that takes `$el` as an argument.
 */

function MaterialSticky() {
  return function($el) {
    console.log("Applying sticky to $el");
  };
}
