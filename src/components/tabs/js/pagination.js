
/**
 * Configure pagination and add listeners for tab changes
 * and Tabs width changes...
 *
 * @returns {updatePagination}
 */
function linkTabPagination(scope, element, attrs, tabsCtrl, $materialEffects) {

  // TODO allow configuration of TAB_MIN_WIDTH
  var TAB_MIN_WIDTH = 8 * 12;           // Must match tab min-width rule in _tabs.scss
  var PAGINATORS_WIDTH = (8 * 4) * 2;   // Must match (2 * width of paginators) in scss

  var tabsHeader = findNode('.tabs-header-items-container', element); // excludes paginators
  var buttonBar = findNode('.tabs-header-items', element);

  var pagination = scope.pagination = {
    next: function() { selectPageAt(pagination.page + 1); },
    prev: function() { selectPageAt(pagination.page - 1); }
  };

  return updatePagination;

  /**
   * When the window resizes [`resize`] or the tabs are added/removed
   * [$materialTabsChanged], then calculate pagination-width and
   * update both the current page (if needed) and the tab headers width...
   */
  function updatePagination() {

    var tabs = buttonBar.children();
    var tabsWidth = element.prop('clientWidth') - PAGINATORS_WIDTH;
    var needPagination = (tabsWidth > 0) && ((TAB_MIN_WIDTH * tabs.length) > tabsWidth);
    var paginationToggled = (needPagination !== pagination.active);

    pagination.active = needPagination;

    if (needPagination) {

      pagination.pagesCount = Math.ceil((TAB_MIN_WIDTH * tabs.length) / tabsWidth);
      pagination.itemsPerPage = Math.max(1, Math.floor(tabs.length / pagination.pagesCount));
      pagination.tabWidth = tabsWidth / pagination.itemsPerPage;

      // If we just activated pagination, go to page 0 and watch the
      // selected tab index to be sure we're on the same page
      var pageIndex = getPageAtTabIndex(scope.$selIndex);

      // Manually set width of page...
      buttonBar.css('width', pagination.tabWidth * tabs.length + 'px');

      selectPageAt( pageIndex );

    } else {

      if (paginationToggled) {
        // Release buttonBar to be self-adjust to size of all tab buttons
        // Slide tab buttons to show all buttons (starting at first)

        buttonBar.css('width', '');

        selectPageAt( 0 );
      }
    }
  }

  /**
   * Select the specified page in the page group and
   * also change the selected the tab if the current
   * tab selected is **not** within the new page range.
   *
   * @param page
   */
  function selectPageAt(page) {
    var lastPage = pagination.pagesCount - 1;
    var lastTab = buttonBar.children().length - 1;

    if ( page < 0 ) page = 0;
    if ( page > lastPage ) page = lastPage;

    pagination.startIndex = !pagination.active ? 0       : page * pagination.itemsPerPage;
    pagination.endIndex   = !pagination.active ? lastTab : pagination.startIndex + pagination.itemsPerPage - 1;
    pagination.hasPrev    = !pagination.active ? false   : page > 0;
    pagination.hasNext    = !pagination.active ? false   : (page + 1) < pagination.pagesCount;

    slideTabButtons( -page * pagination.itemsPerPage * pagination.tabWidth );

    if ( !isTabInRange(scope.$selIndex) ) {
      var index = (page > pagination.page) ?  pagination.startIndex : pagination.endIndex;

      // Only change selected tab IF the current tab is not `in range`
      tabsCtrl.selectAt( index );
    }

    pagination.page = page;

  }

  /**
   * Determine the associated page for the specified tab index
   * @param tabIndex
   */
  function getPageAtTabIndex( tabIndex ) {

    var numPages = pagination.pagesCount;
    var lastTab = (pagination.itemsPerPage * pagination.pagesCount) - 1;
    var lastPage = pagination.pagesCount - 1;

    return (numPages < 1)       ? -1       :
      (tabIndex < 0)       ?  0       :
      (tabIndex > lastTab) ? lastPage : Math.floor(tabIndex / pagination.itemsPerPage);
  }

  /**
   * Perform animated CSS translation of the tab buttons container
   * @param xOffset
   */
  function slideTabButtons( xOffset ) {
    if ( scope.pagingOffset == xOffset ) return;
    if ( isNaN(xOffset) ) xOffset = 0;

    scope.pagingOffset = xOffset;
    buttonBar.css( $materialEffects.TRANSFORM, 'translate3d(' + xOffset + 'px,0,0)');
  }

  /**
   * Is the specified tabIndex with the tab range allowed
   * for the current page/pagination?
   *
   * @param tabIndex
   * @returns {boolean}
   */
  function isTabInRange( tabIndex ){
    return (tabIndex >= pagination.startIndex) &&
      (tabIndex <= pagination.endIndex);
  }

}
