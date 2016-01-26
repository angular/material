/**
 * @ngdoc module
 * @name material.components.whiteframe
 */
angular
  .module('material.components.whiteframe', ['material.core'])
  .directive('mdWhiteframe', MdWhiteframeDirective);

/**
 * @private
 * @ngdoc directive
 * @module material.components.whiteframe
 * @name mdWhiteframe
 * @restrict A
 *
 * @description
 * The md-whiteframe directive allows you to apply an elevation shadow to an element.
 *
 * The attribute values needs to be a number between 1 and 24.
 *
 * ### Notes
 * - If there is no value specified it defaults to 4dp.
 * - If the value is not valid it defaults to 4dp.

 * @usage
 * <hljs lang="html">
 * <div md-whiteframe="3">
 *   <span>Elevation of 3dp</span>
 * </div>
 * </hljs>
 */
function MdWhiteframeDirective($log) {
  var MIN_DP = 1;
  var MAX_DP = 24;
  var DEFAULT_DP = 4;

  return {
    restrict: 'A',
    link: postLink
  };

  function postLink(scope, element, attr) {
    var elevation = parseInt(attr.mdWhiteframe, 10) || DEFAULT_DP;

    if (elevation > MAX_DP || elevation < MIN_DP) {
      $log.warn('md-whiteframe attribute value is invalid. It should be a number between ' + MIN_DP + ' and ' + MAX_DP, element[0]);
      elevation = DEFAULT_DP;
    }

    element.addClass('md-whiteframe-' + elevation + 'dp');
  }
}

