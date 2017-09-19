angular
.module('material.components.tabs')
.service('MdTabsPaginationService', MdTabsPaginationService);

/**
 * @private
 * @module material.components.tabs
 * @name MdTabsPaginationService
 * @description Provides many standalone functions to ease in pagination calculations.
 *
 * Most functions accept the elements and the current offset.
 *
 * The `elements` parameter is typically the value returned from the `getElements()` function of the
 * tabsController.
 *
 * The `offset` parameter is always positive regardless of LTR or RTL (we simply make the LTR one
 * negative when we apply our transform). This is typically the `ctrl.leftOffset` variable in the
 * tabsController.
 *
 * @returns MdTabsPaginationService
 * @constructor
 */
function MdTabsPaginationService() {
  return {
    decreasePageOffset: decreasePageOffset,
    increasePageOffset: increasePageOffset,
    getTabOffsets: getTabOffsets,
    getTotalTabsWidth: getTotalTabsWidth
  };

  /**
   * Returns the offset for the next decreasing page.
   *
   * @param elements
   * @param currentOffset
   * @returns {number}
   */
  function decreasePageOffset(elements, currentOffset) {
    var canvas       = elements.canvas,
        tabOffsets   = getTabOffsets(elements),
        i, firstVisibleTabOffset;

    // Find the first fully visible tab in offset range
    for (i = 0; i < tabOffsets.length; i++) {
      if (tabOffsets[i] >= currentOffset) {
        firstVisibleTabOffset = tabOffsets[i];
        break;
      }
    }

    // Return (the first visible tab offset - the tabs container width) without going negative
    return Math.max(0, firstVisibleTabOffset - canvas.clientWidth);
  }

  /**
   * Returns the offset for the next increasing page.
   *
   * @param elements
   * @param currentOffset
   * @returns {number}
   */
  function increasePageOffset(elements, currentOffset) {
    var canvas       = elements.canvas,
        maxOffset    = getTotalTabsWidth(elements) - canvas.clientWidth,
        tabOffsets   = getTabOffsets(elements),
        i, firstHiddenTabOffset;

    // Find the first partially (or fully) invisible tab
    for (i = 0; i < tabOffsets.length, tabOffsets[i] <= currentOffset + canvas.clientWidth; i++) {
      firstHiddenTabOffset = tabOffsets[i];
    }

    // Return the offset of the first hidden tab, or the maximum offset (whichever is smaller)
    return Math.min(maxOffset, firstHiddenTabOffset);
  }

  /**
   * Returns the offsets of all of the tabs based on their widths.
   *
   * @param elements
   * @returns {number[]}
   */
  function getTabOffsets(elements) {
    var i, tab, currentOffset = 0, offsets = [];

    for (i = 0; i < elements.tabs.length; i++) {
      tab = elements.tabs[i];
      offsets.push(currentOffset);
      currentOffset += tab.offsetWidth;
    }

    return offsets;
  }

  /**
   * Sum the width of all tabs.
   *
   * @param elements
   * @returns {number}
   */
  function getTotalTabsWidth(elements) {
    var sum = 0, i, tab;

    for (i = 0; i < elements.tabs.length; i++) {
      tab = elements.tabs[i];
      sum += tab.offsetWidth;
    }

    return sum;
  }

}
