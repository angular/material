/*
 * @ngdoc module
 * @name material.components.backdrop
 * @description Backdrop
 */

/**
 * @ngdoc directive
 * @name mdBackdrop
 * @module material.components.backdrop
 *
 * @restrict E
 *
 * @description
 * `<md-backdrop>` is a backdrop element used by other coponents, such as dialog and bottom sheet.
 * Apply class `opaque` to make the backdrop use the theme backdrop color.
 *
 */
angular.module('material.components.backdrop', [
  'material.services.theming'
])
.directive('mdBackdrop', [
  '$mdTheming',
  BackdropDirective
]);

function BackdropDirective($mdTheming) {
  return $mdTheming;
}
