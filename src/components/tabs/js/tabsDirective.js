/* Disable Tab Pagination */
/**
 * @ngdoc module
 * @name material.components.tabs
 * @description
 *
 * Tabs
 */
angular.module('material.components.tabs')
  .directive('materialTabs', [
    '$q',
    '$window',
    '$timeout',
    '$compile',
    '$materialEffects',
    '$$rAF',
    '$aria',
    TabsDirective
  ]);

/**
 * @ngdoc directive
 * @name materialTabs
 * @module material.components.tabs
 * @order 0
 *
 * @restrict E
 *
 * @description
 * The `<material-tabs>` directive serves as the container for 1..n `<material-tab>` child directives to produces a Tabs components.
 * In turn, the nested `<material-tab>` directive is used to specify a tab label for the **header button** and a [optional] tab view
 * content that will be associated with each tab button.
 *
 * Below is the markup for its simplest usage:
 *
 *  <hljs lang="html">
 *  <material-tabs>
 *    <material-tab label="Tab #1"></material-tab>
 *    <material-tab label="Tab #2"></material-tab>
 *    <material-tab label="Tab #3"></material-tab>
 *  <material-tabs>
 *  </hljs>
 *
 * Tabs supports three (3) usage scenarios:
 *
 *  1. Tabs (buttons only)
 *  2. Tabs with internal view content
 *  3. Tabs with external view content
 *
 * **Tab-only** support is useful when tab buttons are used for custom navigation regardless of any other components, content, or views.
 * **Tabs with internal views** are the traditional usages where each tab has associated view content and the view switching is managed internally by the Tabs component.
 * **Tabs with external view content** is often useful when content associated with each tab is independently managed and data-binding notifications announce tab selection changes.
 *
 * > As a performance bonus, if the tab content is managed internally then the non-active (non-visible) tab contents are temporarily disconnected from the `$scope.$digest()` processes; which restricts and optimizes DOM updates to only the currently active tab.
 *
 * Additional features also include:
 *
 * *  Content can include any markup.
 * *  If a tab is disabled while active/selected, then the next tab will be auto-selected.
 * *  If the currently active tab is the last tab, then next() action will select the first tab.
 * *  Any markup (other than **`<material-tab>`** tags) will be transcluded into the tab header area BEFORE the tab buttons.
 *
 * @param {integer=} selected Index of the active/selected tab
 * @param {boolean=} noink Flag indicates use of ripple ink effects
 * @param {boolean=} nobar Flag indicates use of ink bar effects
 * @param {boolean=} nostretch Flag indicates use of elastic animation for inkBar width and position changes
 * @param {string=}  align-tabs Attribute to indicate position of tab buttons: bottom or top; default is `top`
 *
 * @usage
 * <hljs lang="html">
 * <material-tabs selected="selectedIndex" >
 *   <img ng-src="/img/angular.png" class="centered">
 *
 *   <material-tab
 *      ng-repeat="tab in tabs | orderBy:predicate:reversed"
 *      on-select="onTabSelected(tab)"
 *      on-deselect="announceDeselected(tab)"
 *      disabled="tab.disabled" >
 *
 *       <material-tab-label>
 *           {{tab.title}}
 *           <img src="/img/removeTab.png"
 *                ng-click="removeTab(tab)"
 *                class="delete" >
 *       </material-tab-label>
 *
 *       {{tab.content}}
 *
 *   </material-tab>
 *
 * </material-tabs>
 * </hljs>
 *
 */
function TabsDirective($q, $window, $timeout, $compile, $materialEffects, $$rAF, $aria) {

  return {
    restrict: 'E',
    replace: false,
    transclude: 'true',

    scope: {
      $selIndex: '=?selected'
    },

    compile: compileTabsFn,
    controller: [ '$scope', '$attrs', '$materialComponentRegistry', '$timeout', '$$rAF', TabsController ],

    template:
      '<div class="tabs-header" ng-class="{\'tab-paginating\': pagination.active}">' +

      '  <div class="tab-paginator prev" ng-if="pagination.active" ng-click="pagination.hasPrev && pagination.prev()" ng-class="{active: pagination.hasPrev}">' +
      '  </div>' +
      '  <div class="tabs-header-items-container">' +
      '    <div class="tabs-header-items"></div>' +
      '  </div>' +
      '  <div class="tab-paginator next" ng-if="pagination.active" ng-click="pagination.hasNext && pagination.next()" ng-class="{active: pagination.hasNext}">' +
      '  </div>' +
      '  <material-ink-bar></material-ink-bar>' +

      '</div>'+
      '<div class="tabs-content ng-hide"></div>'

  };

  /**
   * Use prelink to configure inherited scope attributes: noink, nobar, and nostretch;
   * do this before the child elements are linked.
   *
   * @param element
   * @param attr
   * @returns {{pre: materialTabsLink}}
   */
  function compileTabsFn() {

    return {
      pre: function tabsPreLink(scope, element, attrs, tabsCtrl) {
        // These attributes do not have values; but their presence defaults to value == true.
        scope.noink = angular.isDefined(attrs.noink);
        scope.nobar = angular.isDefined(attrs.nobar);
        scope.nostretch = angular.isDefined(attrs.nostretch);

        // Publish for access by nested `<material-tab>` elements
        tabsCtrl.noink = scope.noink;

        scope.$watch('$selIndex', function (index) {
          tabsCtrl.selectAt(index);
        });

        // Remove the `inkBar` element if `nobar` is defined
        var elBar = findNode("material-ink-bar",element);
        if ( elBar && scope.nobar ) {
          elBar.remove();
        }

      },
      post: function tabsPostLink(scope, element, attrs, tabsCtrl, $transclude) {
        var cache = {
          length: 0,
          contains: function (tab) {
            return !angular.isUndefined(cache[tab.$id]);
          }
        };

        var updateInk = linkTabInk(scope, element, tabsCtrl, $q, $materialEffects);
        var updatePagination = linkTabPagination( scope, element, tabsCtrl, $q, $materialEffects );

        var updateAll = function() {
          scope.$evalAsync(function() {
            updatePagination().then( function(){
              // Make sure the ink positioning is correct
              $timeout( updateInk );
            });

            // Make sure ink changes start just after pagination transitions have started...
            $$rAF( updateInk );
          });
        };

        var onWindowResize = $$rAF.debounce( updateAll );
        var onWindowRelease = function() {
          angular.element($window).off('resize', onWindowResize);
        };

        $$rAF(updateAll);

        angular.element($window).on( EVENT.WINDOW_RESIZE, onWindowResize);
        scope.$on( EVENT.TABS_CHANGED, updateAll );
        scope.$on( EVENT.SCOPE_DESTROY, onWindowRelease );

        transcludeHeaderItems();
        transcludeContentItems();

        configureAria();  // Update ARIA values for the Tab group (Tabs)

        alignTabButtons();
        selectDefaultTab();

        // **********************************************************
        // Private Methods
        // **********************************************************

        /**
         * Inject ARIA-specific attributes appropriate for Tab Groups
         */
        function configureAria() {
          var ROLE = Constant.ARIA.ROLE;

          $aria.update( element, {
            'id': buildAriaID(),
            'role': ROLE.TAB_LIST
          });

          /**
           * Build a unique Tabs ID for WAI-ARIA; preserve the existing ID if already
           * specified.
           * @returns {*|string}
           */
          function buildAriaID() {
            return  attrs.id || ("tabs" + "_" + scope.$id);
          }
        }


        /**
         * Change the positioning of the tab header and buttons.
         * If the tabs-align attribute is 'bottom', then the tabs-content
         * container is transposed with the tabs-header
         */
        function alignTabButtons() {
          var align  = attrs.tabsAlign || "top";
          var container = findNode('.tabs-content', element);

          if (align == "bottom") {
            element.prepend(container);
          }
        }

        /**
         * If an initial tab selection has not been specified, then
         * select the first tab by default
         */
        function selectDefaultTab() {
          var tabs = tabsCtrl.$$tabs();

          if ( tabs.length && angular.isUndefined(scope.$selIndex)) {
            tabsCtrl.select(tabs[0]);
          }
        }


        /**
         * Transclude the materialTab items into the tabsHeaderItems container
         *
         */
        function transcludeHeaderItems() {
          $transclude( function (content) {
            var header = findNode('.tabs-header-items', element);
            var parent = angular.element(element[0]);

            angular.forEach(content, function (node) {
              var intoHeader = isNodeType(node, 'material-tab') || isNgRepeat(node);

              if (intoHeader) {
                header.append(node);
              } else {
                parent.prepend(node);
              }
            });
          });
        }


        /**
         * Transclude the materialTab view/body contents into materialView containers; which
         * are stored in the tabsContent area...
         */
        function transcludeContentItems() {
          var cntr = findNode('.tabs-content', element),
              materialViewTmpl = '<div class="material-view" ng-show="active"></div>';

          scope.$watch(getTabsHash, function buildContentItems() {
            var tabs = tabsCtrl.$$tabs(notInCache),
              views = tabs.map(extractContent);

            // At least 1 tab must have valid content to build; otherwise
            // we hide/remove the tabs-content container...

            if (views.some(notEmpty)) {
              angular.forEach(views, function (content, j) {

                var tab = tabs[j++],
                  materialView = $compile(materialViewTmpl)(tab);

                // For ARIA, link the tab content container with the tab button...
                configureAria( materialView, tab );

                // Allow dynamic $digest() disconnect/reconnect of tab content's scope
                enableDisconnect(tab, content.scope);

                // Do we have content DOM nodes ?
                // If transcluded content is not undefined then add all nodes to the materialView

                if (content.nodes) {
                  angular.forEach(content.nodes, function (node) {
                    if ( !isNodeEmpty(node) ) {
                      materialView.append(node);
                    }
                  });
                }

                cntr.append(materialView);
                addToCache(cache, { tab:tab, element: materialView });

              });

              // We have some new content just added...
              showTabContent();

            } else {

              showTabContent(false);

            }


            /**
             * Add class to hide or show the container for the materialView(s)
             * NOTE: the `<div.tabs-content>` is **hidden** by default.
             * @param visible Boolean a value `true` will remove the `class="ng-hide"` setting
             */
            function showTabContent(visible) {
              cntr.toggleClass('ng-hide', !!visible);
            }

            /**
             * Configure ARIA attributes to link tab content back to their respective
             * 'owning' tab buttons.
             */
            function configureAria( cntr, tab ) {

              $aria.update( cntr, {
                'id' : "content_" + tab.ariaId,
                'role' : Constant.ARIA.ROLE.TAB_PANEL,
                'aria-labelledby' : tab.ariaId
              });

            }

          });

          /**
           * Allow tabs to disconnect or reconnect their content from the $digest() processes
           * when unselected or selected (respectively).
           *
           * @param content Special content scope which is a direct child of a `tab` scope
           */
          function enableDisconnect(tab,  content) {
            if ( !content ) return;

            var selectedFn = angular.bind(tab, tab.selected),
                deselectedFn = angular.bind(tab, tab.deselected);

            addDigestConnector(content);

            // 1) Tail-hook deselected()
            tab.deselected = function() {
              deselectedFn();
              tab.$$postDigest(function(){
                content.$disconnect();
              });
            };

             // 2) Head-hook selected()
            tab.selected = function() {
              content.$reconnect();
              selectedFn();
            };

            // Immediate disconnect all non-actives
            if ( !tab.active ) {
              tab.$$postDigest(function(){
                content.$disconnect();
              });
            }
          }

          /**
           * Add tab scope/DOM node to the cache and configure
           * to auto-remove when the scope is destroyed.
           * @param cache
           * @param item
           */
          function addToCache(cache, item) {
            var scope = item.tab;

            cache[ scope.$id ] = item;
            cache.length = cache.length + 1;

            // When the tab is removed, remove its associated material-view Node...
            scope.$on("$destroy", function () {
              angular.element(item.element).remove();

              delete cache[ scope.$id];
              cache.length = cache.length - 1;
            });
          }

          function getTabsHash() {
            return tabsCtrl.$$hash;
          }

          /**
           * Special function to extract transient data regarding transcluded
           * tab content. Data includes dynamic lookup of bound scope for the transcluded content.
           *
           * @see TabDirective::updateTabContent()
           *
           * @param tab
           * @returns {{nodes: *, scope: *}}
           */
          function extractContent(tab) {
            var content = hasContent(tab) ? tab.content : undefined;
            var scope   = (content && content.length) ? angular.element(content[0]).scope() : null;

            // release immediately...
            delete tab.content;

            return { nodes:content, scope:scope };
          }

          function hasContent(tab) {
            return tab.content && tab.content.length;
          }

          function notEmpty(view) {
            var hasContent = false;
            if (angular.isDefined(view.nodes)) {
              angular.forEach(view.nodes, function(node) {
                hasContent = hasContent || !isNodeEmpty(node);
              });
            }
            return hasContent;
          }

          function notInCache(tab) {
            return !cache.contains(tab);
          }
        }

      }
    };

  }
}
