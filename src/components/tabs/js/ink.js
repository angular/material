/**
 * Conditionally configure ink bar animations when the
 * tab selection changes. If `nobar` then do not show the
 * bar nor animate.
 */
function linkTabInk(scope, element, attrs, tabsCtrl, $materialEffects) {
  // TODO scope.nostretch
  if ( scope.nobar ) return;

  // Single inkBar is used for all tabs
  var tabsHeader = findNode('.tabs-header-items-container', element); // excludes paginators
  var inkBar = findNode("material-ink-bar", element);
  var lastLeft = 0;

  // Immediately place the ink bar
  updateInkBar(true);

  // Delay inkBar updates 1-frame until pagination updates...
  return updateInkBar;

  /**
   * Update the position and size of the ink bar based on the
   * specified tab DOM element. If all tabs have been removed, then
   * hide the inkBar.
   *
   * @param tab
   * @param skipAnimation
   */
  function updateInkBar( immediate ) {
    var selButton = tabsCtrl.selectedElement();
    var showInk = selButton && selButton.length && angular.isDefined(inkBar);
    var isHiding = selButton && selButton.hasClass('pagination-hide');

    var styles = { display : 'none', width : '0px' };
    var left = 0, width = 0;

    if ( !showInk || isHiding ) {
      // no animation
      inkBar.toggleClass('animate', (immediate !== true))
      .css({
        display : 'none',
        width : '0px'
      });

    } else {
      // Just a linear animation...

      width = selButton.prop('offsetWidth');
      left = tabsHeader.prop('offsetLeft') + (scope.pagingOffset || 0) + selButton.prop('offsetLeft');

      styles = {
        display : width > 0 ? 'block' : 'none',
        width: width + 'px'
      };
      styles[$materialEffects.TRANSFORM] = 'translate3d(' + left + 'px,0,0)';

      // Before we update the CSS to create a linear slide effect,
      // let's add/remove `animate` class for transition & duration

      inkBar
        .toggleClass('animate', (immediate !== true) )
        .css(styles);

    }
  }
}
