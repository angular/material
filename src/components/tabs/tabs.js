angular.module('material.components.tabs', ['material.utils', 'material.animations', 'material.services'])
  .controller('materialTabsController', [ '$scope', TabsController])
  .directive('materialTabs', [ '$compile', '$timeout', '$$q', 'materialEffects', TabsDirective ])
  .directive('materialTab', [ '$attrBind', '$compile', TabDirective  ]);

/**
 * @ngdoc directive
 * @name materialTabs
 * @module material.components.tabs
 *
 * @restrict E
 *
 * @description
 * materialTabs is the outer directive and container for the tabs functionality
 *
 * @param {integer=} selected Index of the active/selected tab
 * @param {boolean}  noink Flag indicates use of RippleInk effects
 * @param {boolean}  nobar Flag indicates use of InkBar effects
 * @param {boolean}  nostretch Flag indicates use of elastic animation for inkBar width and position changes
 * @param {string}   align-tabs Attribute to indicate position of tab buttons: bottom or top; default is `top`
 *
 * @example
 <example module="material.components.tabs">
 <file name="index.html">
 <h3>Static Tabs: </h3>
 <p>No ink effect and no sliding bar. Tab #1 is active and #2 is disabled.</p>
 <material-tabs selected="0" noink nobar nostretch>
 <material-tab>ITEM ONE</material-tab>
 <material-tab disabled="true" title="ITEM TWO"></material-tab>
 <material-tab>ITEM THREE</material-tab>
 </material-tabs>
 </file>
 </example>
 *
 */

function TabsDirective($compile, $timeout, $$q, materialEffects) {

  return {
    restrict: 'E',
    replace: false,
    transclude: 'true',

    scope: {
      $selIndex: '=?selected'
    },

    compile: compileTabsFn,
    controller: [ '$scope', '$attrs', '$materialComponentRegistry', '$timeout', TabsController ],

    template:
      '<div class="tabs-header">' +
      '  <div class="tabs-header-items"></div>' +
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
      pre: function tabsPreLink(scope, element, attrs, tabsController) {

        // These attributes do not have values; but their presence defaults to value == true.
        scope.noink = angular.isDefined(attrs.noink);
        scope.nobar = angular.isDefined(attrs.nobar);
        scope.nostretch = angular.isDefined(attrs.nostretch);

        // Publish for access by nested `<material-tab>` elements
        tabsController.noink = scope.noink;

        // Watch for external changes `selected` & auto-select the specified tab
        // Stop watching when the <material-tabs> directive is released
        scope.$on("$destroy", scope.$watch('$selIndex', function (index) {
          tabsController.selectAt(index);
        }));

        // Remove the `inkBar` element if `nobar` is defined
        var elBar = findNode("material-ink-bar",element);
        if ( elBar && scope.nobar ) {
          elBar.remove();
        }

      },
      post: function tabsPostLink(scope, element, attrs, tabsController, $transclude) {
        var  cache = {
          length: 0,
          contains: function (tab) {
            return !angular.isUndefined(cache[tab.$id]);
          }
        };

        transcludeHeaderItems();
        transcludeContentItems();

        configureInk();
        alignTabButtons();
        selectDefaultTab();

        // **********************************************************
        // Private Methods
        // **********************************************************

        /**
         * Conditionally configure ink bar animations when the
         * tab selection changes. If `nobar` then do not show the
         * bar nor animate.
         */
        function configureInk() {
          if ( scope.nobar ) return;

          // Single inkBar is used for all tabs
          var inkBar = findNode("material-ink-bar", element);

          // On resize or tabChange
          tabsController.onTabChange = updateInkBar;
          angular.element(window).on('resize', function() {
            updateInkBar(tabsController.selectedElement(), true);
          });

          // Immediately place the ink bar
          updateInkBar(tabsController.selectedElement(), true );

          /**
           * Update the position and size of the ink bar based on the
           * specified tab DOM element
           * @param tab
           * @param skipAnimation
           */
          function updateInkBar(tab, skipAnimation) {
            if ( angular.isDefined(tab) && angular.isDefined(inkBar) ) {

              var tabNode = tab[0];
              var width = ( tabsController.$$tabs().length > 1 ) ? tabNode.offsetWidth : 0;
              var styles = {
                left : tabNode.offsetLeft +'px',
                width : width +'px' ,
                display : width > 0 ? 'block' : 'none'
              };

              if( !!skipAnimation ) {
                inkBar.css(styles);
              } else {
                materialEffects.inkBar(inkBar, styles);
              }
            }

          }
        }

        /**
         * Change the positioning of the tab header and buttons.
         * If the tabs-align attribute is 'bottom', then the tabs-content
         * container is transposed with the tabs-header
         */
        function alignTabButtons() {
          var align  = attrs['tabsAlign'] || "top";
          var container = findNode('.tabs-content', element);

          if ( align == "bottom") {
            element.prepend(container);
          }
        }

        /**
         * If an initial tab selection has not been specified, then
         * select the first tab by default
         */
        function selectDefaultTab() {
          var tabs = tabsController.$$tabs();

          if ( tabs.length && angular.isUndefined(scope.$selIndex)) {
            tabsController.select(tabs[0]);
          }
        }


        /**
         * Transclude the materialTab items into the tabsHeaderItems container
         *
         */
        function transcludeHeaderItems() {
          $transclude(function (content) {
            var header = findNode('.tabs-header-items', element);
            var parent = angular.element(element[0]);

            angular.forEach(content, function (node) {
              var intoHeader = isNodeType(node, 'material-tab') || isNgRepeat(node);

              if (intoHeader) {
                header.append(node);
              }
              else {
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
            var tabs = tabsController.$$tabs(notInCache),
              views = tabs.map(extractContent);

            // At least 1 tab must have valid content to build; otherwise
            // we hide/remove the tabs-content container...

            if (views.some(notEmpty)) {
              angular.forEach(views, function (elements, j) {

                var tab = tabs[j++],
                  materialView = $compile(materialViewTmpl)(tab);

                // Allow dynamic $digest() disconnect/reconnect of scope
                enableDisconnect(tab);

                if (elements) {
                  // If transcluded content is not undefined then add all nodes to the materialView
                  angular.forEach(elements, function (node) {
                    materialView.append(node);
                  });
                }

                cntr.append(materialView);
                addToCache(cache, { tab:tab, element: materialView });

              });
            }

            // Add class to hide or show the container for the materialView(s)
            angular.bind(cntr, cache.length ? cntr.removeClass : cntr.addClass)('ng-hide');

          });

          /**
           * Allow tabs to disconnect or reconnect their content from the $digest() processes
           * when unselected or selected (respectively).
           *
           * @param scope Special content scope which is a direct child of a `tab` scope
           */
          function enableDisconnect(scope) {
            var selectedFn = angular.bind(scope, scope.selected),
                deselectedFn = angular.bind(scope, scope.deselected);

            addDigestConnector(scope);

            // 1) Tail-hook deselected()
            scope.deselected = function() {
              deselectedFn();
              scope.$$postDigest(function(){
                scope.$disconnect();
              });
            };

             // 2) Head-hook selected()
            scope.selected = function() {
              scope.$reconnect();
              selectedFn();
            };

            // Immediate disconnect all non-actives
            if ( !scope.active ) {
              scope.$$postDigest(function(){
                scope.$disconnect();
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
            return tabsController.$$hash;
          }

          function extractContent(tab) {
            var content = hasContent(tab) ? tab.content : undefined;

            delete tab.content; // release immediately...

            return content;
          }

          function hasContent(tab) {
            return tab.content && tab.content.length;
          }

          function notEmpty(view) {
            return angular.isDefined(view);
          }

          function notInCache(tab) {
            return !cache.contains(tab);
          }
        }

      }
    };

    function findNode(selector, element) {
      var container = element[0];
      return angular.element(container.querySelector(selector));
    }

  }

}

/**
 /**
 * @ngdoc directive
 * @name materialTab
 * @module material.components.tabs
 *
 * @restrict E
 *
 * @param {string=} onSelect A function expression to call when the tab is selected.
 * @param {string=} onDeselect A function expression to call when the tab is deselected.
 * @param {boolean=} active A binding, telling whether or not this tab is selected.
 * @param {boolean=} disabled A binding, telling whether or not this tab is disabled.
 * @param {string=} title The visible heading, or title, of the tab. Set HTML headings with {@link ui.bootstrap.tabs.directive:tabHeading tabHeading}.
 *
 * @description
 * Creates a tab with a heading and (optional) content. Must be placed within a {@link material.components.tabs.directive:materialTabs materialTabs}.
 *
 * @example
 *
 */
function TabDirective($attrBind, $compile ) {
  var noop = angular.noop;

  return {
    restrict: 'E',
    replace: false,
    require: "^materialTabs",
    transclude: 'true',
    scope: true,
    link: linkTab,
    template:
      '<material-ripple initial-opacity="0.9" opacity-decay-velocity="0.89"> </material-ripple> ' +
      '<material-tab-label ' +
        'ng-class="{ disabled : disabled, active : active }"  >' +
      '</material-tab-label>'

  };

  function linkTab(scope, element, attrs, tabsController, $transclude) {
    var defaults = { active: false, disabled: false, deselected: noop, selected: noop };

    // Since using scope=true for inherited new scope,
    // then manually scan element attributes for forced local mappings...

    $attrBind(scope, attrs, {
      label: '@?',
      active: '=?',
      disabled: '=?',
      deselected: '&onDeselect',
      selected: '&onSelect'
    }, defaults);

    configureEffects();
    configureWatchers();
    updateTabContent(scope);

    // Click support for entire <material-tab /> element
    element.on('click', function onRequestSelect() {
      if (!scope.disabled) {
        scope.$apply(function () {
          tabsController.select(scope);
        })
      }
    });

    tabsController.add(scope, element);

    // **********************************************************
    // Private Methods
    // **********************************************************

    /**
     * If materialTabs `noInk` is true, then remove the materialInkBar feature
     * By default, the materialInkBar tag is auto injected; @see line 255
     */
    function configureEffects() {
      if ( tabsController.noink ) {

        // Since <material-ripple/> directive replaces itself with `<div.material-ink-ripple />` element
        var elRipple = angular.element(element[0].querySelector('.material-ink-ripple'));
        if (elRipple) {
          elRipple.remove();
        }
      }
    }

    /**
     * Auto select the next tab if the current tab is active and
     * has been disabled.
     */
    function configureWatchers() {
      var unwatch = scope.$watch('disabled', function (isDisabled) {
        if (scope.active && isDisabled) {
          tabsController.next(scope);
        }
      });

      scope.$on("$destroy", function () {
        unwatch();
        tabsController.remove(scope);
      });
    }

    /**
     * Transpose the optional `label` attribute value or materialTabHeader or `content` body
     * into the body of the materialTabButton... all other content is saved in scope.content
     * and used by TabsController to inject into the `tabs-content` container.
     */
    function updateTabContent(scope) {
      // Check to override label attribute with the content of the <material-tab-header> node,
      // If a materialTabHeader is not specified, then the node will be considered
      // a <material-view> content element...

      $transclude(function (contents) {
        scope.content = [ ];

        angular.forEach(contents, function (node) {
          if (!isNodeEmpty(node)) {
            if (isNodeType(node, 'material-tab-label')) {
              // Simulate use of `label` attribute
              scope.label = node.childNodes;

            } else {

              // Attach to scope for future transclusion into materialView(s)
              scope.content.push(node);
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

/**
 * @ngdoc controller
 * @name materialTabsController
 * @module material.components.tabs
 *
 * @private
 *
 */
function TabsController($scope, $attrs, $materialComponentRegistry, $timeout, $$q) {
  var list = iterator([], true),
    elements = { },
    selected = null,
    self = this;

  $materialComponentRegistry.register(self, $attrs.componentId || "tabs");

  // Methods used by <material-tab> and children

  this.add = addTab;
  this.remove = removeTab;
  this.select = selectTab;
  this.selectAt = selectTabAt;
  this.next = selectNext;
  this.previous = selectPrevious;

  // Property for child access
  this.noink = !!$scope.noink;
  this.nobar = !!$scope.nobar;
  this.scope = $scope;

  // Special internal accessor to access scopes and tab `content`
  // Used by TabsDirective::buildContentItems()

  this.$$tabs = findTabs;
  this.$$hash = "";

  // used within the link-Phase of materialTabs
  this.onTabChange = angular.noop;
  this.selectedElement = function() {
    return findElementFor( selected );
  }

  /**
   * Find the DOM element associated with the tab/scope
   * @param tab
   * @returns {*}
   */
  function findElementFor(tab) {
    if ( angular.isUndefined(tab) ) {
      tab = selected;
    }
    return tab ? elements[ tab.$id ] : undefined;
  }

  /**
   * Publish array of tab scope items
   * NOTE: Tabs are not required to have `contents` and the
   *       node may be undefined.
   * @returns {*} Array
   */
  function findTabs(filterBy) {
    return list.items().filter(filterBy || angular.identity);
  }

  /**
   * Create unique hashKey representing all available
   * tabs.
   */
  function updateHash() {
    self.$$hash = list.items()
      .map(function (it) {
        return it.$id;
      })
      .join(',');
  }

  /**
   * Select specified tab; deselect all others (if any selected)
   * @param tab
   */
  function selectTab(tab) {
    if ( tab == selected ) return;

    var activate = makeActivator(true),
      deactivate = makeActivator(false);

    // Turn off all tabs (if current active)
    angular.forEach(list.items(), deactivate);

    // Activate the specified tab (or next available)
    selected = activate(tab.disabled ? list.next(tab) : tab);

    // update external models and trigger databinding watchers
    $scope.$selIndex = String(selected.$index || list.indexOf(selected));

    // update the tabs ink to indicate the selected tab
    self.onTabChange( findElementFor(selected) );

    return selected;
  }

  /**
   * Select tab based on its index position
   * @param index
   */
  function selectTabAt(index) {
    if (list.inRange(index)) {
      var matches = list.findBy("$index", index),
        it = matches ? matches[0] : null;

      if (it != selected) {
        selectTab(it);
      }
    }
  }

  /**
   * If not specified (in parent scope; as part of ng-repeat), create
   * `$index` property as part of current scope.
   * NOTE: This prevents scope variable shadowing...
   * @param tab
   * @param index
   */
  function updateIndex(tab, index) {
    if (angular.isUndefined(tab.$index)) {
      tab.$index = index;
    }
  }

  /**
   * Add tab to list and auto-select; default adds item to end of list
   * @param tab
   */
  function addTab(tab, element) {

    updateIndex(tab, list.count());

    // cache materialTab DOM element; these are not materialView elements
    elements[ tab.$id ] = element;

    if (!list.contains(tab)) {
      var pos = list.add(tab, tab.$index);

      // Should we auto-select it?
      if ($scope.$selIndex == pos) {
        selectTab(tab);
      }
    }


    updateHash();

    return tab.$index;
  }

  /**
   * Remove the specified tab from the list
   * Auto select the next tab or the previous tab (if last)
   * @param tab
   */
  function removeTab(tab) {
    if (list.contains(tab)) {

      selectTab(selected = list.next(tab, isEnabled));
      list.remove(tab);

      // another tab was removed, make sure to update ink bar
      $timeout(function(){
        self.onTabChange( findElementFor(selected), true );
        delete elements[tab.$id];
      },300);

    }

    updateHash();
  }

  /**
   * Select the next tab in the list
   * @returns {*} Tab
   */
  function selectNext() {
    return selectTab(selected = list.next(selected, isEnabled));
  }

  /**
   * Select the previous tab
   * @returns {*} Tab
   */
  function selectPrevious() {
    return selectTab(selected = list.previous(selected, isEnabled));
  }

  /**
   * Validation criteria for list iterator when List::next() or List::previous() is used..:
   * In this case, the list iterator should skip items that are disabled.
   * @param tab
   * @returns {boolean}
   */
  function isEnabled(tab) {
    return tab && !tab.disabled;
  }

  /**
   * Partial application to build function that will
   * mark the specified tab as active or not. This also
   * allows the `updateStatus` function to be used as an iterator.
   *
   * @param active
   */
  function makeActivator(active) {

    return function updateState(tab) {
      if (tab && (active != tab.active)) {
        tab.active = active;

        if (active) {
          selected = tab;

          tab.selected();

        } else {
          if (selected == tab) {
            selected = null;
          }

          tab.deselected();

        }
        return tab;
      }
      return null;


    }
  }

}

var trim = (function () {
  function isString(value) {
    return typeof value === 'string';
  }

  // native trim is way faster: http://jsperf.com/angular-trim-test
  // but IE doesn't have it... :-(
  // TODO: we should move this into IE/ES5 polyfill
  if (!String.prototype.trim) {
    return function (value) {
      return isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
    };
  }
  return function (value) {
    return isString(value) ? value.trim() : value;
  };
})();

/**
 * Determine if the DOM element is of a certain tag type
 * or has the specified attribute type
 *
 * @param node
 * @returns {*|boolean}
 */
var isNodeType = function (node, type) {
  return node.tagName && (
    node.hasAttribute(type) ||
    node.hasAttribute('data-' + type) ||
    node.tagName.toLowerCase() === type ||
    node.tagName.toLowerCase() === 'data-' + type
    );
};

var isNgRepeat = function (node) {
  var COMMENT_NODE = 8;
  return (node.nodeType == COMMENT_NODE) && (node.nodeValue.indexOf('ngRepeat') > -1);
};

/**
 * Is the an empty text string
 * @param node
 * @returns {boolean}
 */
var isNodeEmpty = function (node) {
  var TEXT_NODE = 3;
  return (node.nodeType == TEXT_NODE) && (trim(node.nodeValue) == "");
};

