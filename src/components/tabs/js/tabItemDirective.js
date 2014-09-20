angular.module('material.components.tabs')
  .directive('materialTab', [
    '$attrBind',
    '$aria',
    '$materialInkRipple',
    TabDirective  
  ]);

/**
 * @ngdoc directive
 * @name materialTab
 * @module material.components.tabs
 * @order 1
 *
 * @restrict E
 *
 * @description
 * `<material-tab>` is the nested directive used [within `<material-tabs>`] to specify each tab with a **label** and optional *view content*
 *
 * If the `label` attribute is not specified, then an optional `<material-tab-label>` tag can be used to specified more
 * complex tab header markup. If neither the **label** nor the **material-tab-label** are specified, then the nested
 * markup of the `<material-tab>` is used as the tab header markup.
 *
 * If a tab **label** has been identified, then any **non-**`<material-tab-label>` markup
 * will be considered tab content and will be transcluded to the internal `<div class="tabs-content">` container.
 *
 * This container is used by the TabsController to show/hide the active tab's content view. This synchronization is
 * automatically managed by the internal TabsController whenever the tab selection changes. Selection changes can
 * be initiated via data binding changes, programmatic invocation, or user gestures.
 *
 * @param {string=} label Optional attribute to specify a simple string as the tab label
 * @param {boolean=} active Flag indicates if the tab is currently selected; normally the `<material-tabs selected="">`; attribute is used instead.
 * @param {boolean=} ngDisabled Flag indicates if the tab is disabled: not selectable with no ink effects
 * @param {expression=} deselected Expression to be evaluated after the tab has been de-selected.
 * @param {expression=} selected Expression to be evaluated after the tab has been selected.
 *
 *
 * @usage
 *
 * <hljs lang="html">
 * <material-tab label="" disabled="" selected="" deselected="" >
 *   <h3>My Tab content</h3>
 * </material-tab>
 *
 * <material-tab >
 *   <material-tab-label>
 *     <h3>My Tab content</h3>
 *   </material-tab-label>
 *   <p>
 *     Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
 *     totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
 *     dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
 *     sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
 *   </p>
 * </material-tab>
 * </hljs>
 *
 */
function TabDirective( $attrBind, $aria, $materialInkRipple) {
  var noop = angular.noop;

  return {
    restrict: 'E',
    replace: false,
    require: "^materialTabs",
    transclude: 'true',
    scope: true,
    link: linkTab,
    template:
      '<material-tab-label></material-tab-label>'
  };

  function linkTab(scope, element, attrs, tabsCtrl, $transclude) {
    var defaults = { active: false, disabled: false, deselected: noop, selected: noop };

    // Since using scope=true for inherited new scope,
    // then manually scan element attributes for forced local mappings...

    $attrBind(scope, attrs, {
      label: '@?',
      active: '=?',
      disabled: '=?ngDisabled',
      deselected: '&onDeselect',
      selected: '&onSelect'
    }, defaults);

    scope.$watch('active', function(isActive) {
      element.toggleClass('active', isActive);
    });

    $materialInkRipple.attachButtonBehavior(element);

    configureWatchers();
    updateTabContent(scope);

    // Update ARIA values for each tab element
    configureAria(element, scope);

    element.on('click', function onRequestSelect()
      {
        // Click support for entire <material-tab /> element
        if ( !scope.disabled ) tabsCtrl.select(scope);
        else                   tabsCtrl.focusSelected();

      })
      .on('keydown', function onRequestSelect(event)
      {
        if (event.which == Constant.KEY_CODE.SPACE )            tabsCtrl.select(scope);
        else if (event.which === Constant.KEY_CODE.LEFT_ARROW)  tabsCtrl.previous(scope);
        else if (event.which === Constant.KEY_CODE.RIGHT_ARROW) tabsCtrl.next(scope);

      });

    tabsCtrl.add(scope, element);

    // **********************************************************
    // Private Methods
    // **********************************************************


    /**
     * Inject ARIA-specific attributes appropriate for each Tab button
     */
    function configureAria( element, scope ){
      var ROLE = Constant.ARIA.ROLE;

      scope.ariaId = buildAriaID();
      $aria.update( element, {
        'id' :  scope.ariaId,
        'role' : ROLE.TAB,
        'aria-selected' : false,
        'aria-controls' : "content_" + scope.ariaId
      });

      /**
       * Build a unique ID for each Tab that will be used for WAI-ARIA.
       * Preserve existing ID if already specified.
       * @returns {*|string}
       */
      function buildAriaID() {
        return attrs.id || ( ROLE.TAB + "_" + tabsCtrl.$scope.$id + "_" + scope.$id );
      }
    }

    /**
     * Auto select the next tab if the current tab is active and
     * has been disabled.
     *
     * Set tab index for the current tab (0), with all other tabs
     * outside of the tab order (-1)
     *
     */
    function configureWatchers() {
      var unwatch = scope.$watch('disabled', function (isDisabled) {
        if (scope.active && isDisabled) {
          tabsCtrl.next(scope);
        }
      });

      scope.$watch('active', function (isActive) {

        $aria.update( element, {
          'aria-selected' : isActive,
          'tabIndex' : isActive === true ? 0 : -1
        });

      });

      scope.$on("$destroy", function () {
        unwatch();
        tabsCtrl.remove(scope);
      });
    }

    /**
     * Transpose the optional `label` attribute value or materialTabHeader or `content` body
     * into the body of the materialTabButton... all other content is saved in scope.content
     * and used by TabsController to inject into the `tabs-content` container.
     */
    function updateTabContent(scope) {
      var tab = scope;

      // Check to override label attribute with the content of the <material-tab-header> node,
      // If a materialTabHeader is not specified, then the node will be considered
      // a <material-view> content element...
      $transclude(function ( contents ) {

        // Transient references...
        tab.content = [ ];

        angular.forEach(contents, function (node) {

          if (!isNodeEmpty(node)) {
            if (isNodeType(node, 'material-tab-label')) {
              // Simulate use of `label` attribute

              tab.label = node.childNodes;

            } else {
              // Transient references...
              //
              // Attach to scope for future transclusion into materialView(s)
              // We need the bound scope for the content elements; which is NOT
              // the scope of tab or material-view container...

              tab.content.push(node);
            }
          }
        });

      });

      // Prepare to assign the materialTabButton content
      // Use the label attribute or fallback to TabHeader content

      var cntr = angular.element(element[0].querySelector('material-tab-label'));

      if (angular.isDefined(scope.label)) {
        // The `label` attribute is the default source

        cntr.append(scope.label);

        delete scope.label;

      } else {

        // NOTE: If not specified, all markup and content is assumed
        // to be used for the tab label.

        angular.forEach(scope.content, function (node) {
          cntr.append(node);
        });

        delete scope.content;
      }
    }

  }
}
