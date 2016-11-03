/**
 * @ngdoc module
 * @name material.components.tooltip
 */
angular
    .module('material.components.tooltip', [
      'material.core',
      'material.components.popover'
    ])
    .directive('mdTooltip', MdTooltipDirective);


/**
 * @ngdoc directive
 * @name mdTooltip
 * @module material.components.tooltip
 * @description
 * Tooltips are used to describe elements that are interactive and primarily
 * graphical (not textual).
 *
 * Place a `<md-tooltip>` as a child of the element it describes.
 *
 * A tooltip will activate when the user hovers over, focuses, or touches the
 * parent element.
 *
 * @usage
 * <hljs lang="html">
 *   <md-button class="md-fab md-accent" aria-label="Play">
 *     <md-tooltip>Play Music</md-tooltip>
 *     <md-icon md-svg-src="img/icons/ic_play_arrow_24px.svg"></md-icon>
 *   </md-button>
 * </hljs>
 *
 * @param {number=} md-z-index The visual level that the tooltip will appear
 *     in comparison with the rest of the elements of the application.
 * @param {expression=} md-visible Boolean bound to whether the tooltip is
 *     currently visible.
 * @param {number=} md-delay How many milliseconds to wait to show the tooltip
 *     after the user hovers over, focuses, or touches the parent element.
 *     Defaults to 0ms on non-touch devices and 75ms on touch.
 * @param {boolean=} md-autohide If present or provided with a boolean value,
 *     the tooltip will hide on mouse leave, regardless of focus.
 * @param {string=} md-direction The direction that the tooltip is shown,
 *     relative to the parent element. Supports top, right, bottom, and left.
 *     Defaults to bottom.
 */
function MdTooltipDirective($mdPopover) {
  return {
    restrict: 'E',
    priority: 210, // Before ngAria
    scope: {
      mdZIndex: '=?',
      mdEnabled: '=?',
      mdVisible: '=?',
      mdAutohide: '=?',
      mdOpenDelay: '@?mdDelay',
      mdPosition: '@?mdDirection'
    },
    link: linkFunc
  };

  function linkFunc(scope, element, attrs) {
    var popoverRef = $mdPopover.create(scope, element, attrs);
  }
}
