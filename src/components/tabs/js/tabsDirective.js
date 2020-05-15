/**
 * @ngdoc directive
 * @name mdTabs
 * @module material.components.tabs
 *
 * @restrict E
 *
 * @description
 * The `<md-tabs>` directive serves as the container for 1..n
 * <a ng-href="api/directive/mdTab">`<md-tab>`</a> child directives.
 * In turn, the nested `<md-tab>` directive is used to specify a tab label for the
 * **header button** and <i>optional</i> tab view content that will be associated with each tab
 * button.
 *
 * Below is the markup for its simplest usage:
 *
 *  <hljs lang="html">
 *  <md-tabs>
 *    <md-tab label="Tab #1"></md-tab>
 *    <md-tab label="Tab #2"></md-tab>
 *    <md-tab label="Tab #3"></md-tab>
 *  </md-tabs>
 *  </hljs>
 *
 * Tabs support three (3) usage scenarios:
 *
 *  1. Tabs (buttons only)
 *  2. Tabs with internal view content
 *  3. Tabs with external view content
 *
 * **Tabs-only** support is useful when tab buttons are used for custom navigation regardless of any
 * other components, content, or views.
 *
 * <i><b>Note:</b> If you are using the Tabs component for page-level navigation, please use
 * the <a ng-href="./api/directive/mdNavBar">NavBar component</a> instead. It handles this
 * case a more natively and more performantly.</i>
 *
 * **Tabs with internal views** are the traditional usage where each tab has associated view
 * content and the view switching is managed internally by the Tabs component.
 *
 * **Tabs with external view content** is often useful when content associated with each tab is
 * independently managed and data-binding notifications announce tab selection changes.
 *
 * Additional features also include:
 *
 * *  Content can include any markup.
 * *  If a tab is disabled while active/selected, then the next tab will be auto-selected.
 *
 * ### Explanation of tab stretching
 *
 * Initially, tabs will have an inherent size.  This size will either be defined by how much space
 * is needed to accommodate their text or set by the user through CSS.
 * Calculations will be based on this size.
 *
 * On mobile devices, tabs will be expanded to fill the available horizontal space.
 * When this happens, all tabs will become the same size.
 *
 * On desktops, by default, stretching will never occur.
 *
 * This default behavior can be overridden through the `md-stretch-tabs` attribute.
 * Here is a table showing when stretching will occur:
 *
 * `md-stretch-tabs` | mobile    | desktop
 * ------------------|-----------|--------
 * `auto`            | stretched | ---
 * `always`          | stretched | stretched
 * `never`           | ---       | ---
 *
 * @param {integer=} md-selected Index of the active/selected tab.
 * @param {boolean=} md-no-ink-bar If present, disables the selection ink bar.
 * @param {string=}  md-align-tabs Attribute to indicate position of tab buttons: `bottom` or `top`;
 *  Default is `top`.
 * @param {string=} md-stretch-tabs Attribute to indicate whether or not to stretch tabs: `auto`,
 *  `always`, or `never`; Default is `auto`.
 * @param {boolean=} md-dynamic-height When enabled, the tab wrapper will resize based on the
 *  contents of the selected tab.
 * @param {boolean=} md-border-bottom If present, shows a solid `1px` border between the tabs and
 *  their content.
 * @param {boolean=} md-center-tabs If defined, tabs will be centered provided there is no need
 *  for pagination.
 * @param {boolean=} md-no-pagination When enabled, pagination will remain off.
 * @param {boolean=} md-swipe-content When enabled, swipe gestures will be enabled for the content
 *  area to allow swiping between tabs.
 * @param {boolean=} md-enable-disconnect When enabled, scopes will be disconnected for tabs that
 *  are not being displayed. This provides a performance boost, but may also cause unexpected
 *  issues. It is not recommended for most users.
 * @param {boolean=} md-autoselect When present, any tabs added after the initial load will be
 *  automatically selected.
 * @param {boolean=} md-no-select-click When true, click events will not be fired when the value of
 *  `md-active` on an `md-tab` changes. This is useful when using tabs with UI-Router's child
 *  states, as triggering a click event in that case can cause an extra tab change to occur.
 * @param {string=} md-navigation-hint Attribute to override the default `tablist` navigation hint
 *  that screen readers will announce to provide instructions for navigating between tabs. This is
 *  desirable when you want the hint to be in a different language. Default is "Use the left and
 *  right arrow keys to navigate between tabs".
 *
 * @usage
 * <hljs lang="html">
 * <md-tabs md-selected="selectedIndex" >
 *   <img ng-src="img/angular.png" class="centered">
 *   <md-tab
 *       ng-repeat="tab in tabs | orderBy:predicate:reversed"
 *       md-on-select="onTabSelected(tab)"
 *       md-on-deselect="announceDeselected(tab)"
 *       ng-disabled="tab.disabled">
 *     <md-tab-label>
 *       {{tab.title}}
 *       <img src="img/removeTab.png" ng-click="removeTab(tab)" class="delete">
 *     </md-tab-label>
 *     <md-tab-body>
 *       {{tab.content}}
 *     </md-tab-body>
 *   </md-tab>
 * </md-tabs>
 * </hljs>
 *
 */
angular
    .module('material.components.tabs')
    .directive('mdTabs', MdTabs);

function MdTabs ($$mdSvgRegistry) {
  return {
    scope:            {
      navigationHint: '@?mdNavigationHint',
      selectedIndex: '=?mdSelected'
    },
    template:         function (element, attr) {
      attr.$mdTabsTemplate = element.html();
      return '' +
        '<md-tabs-wrapper> ' +
          '<md-tab-data></md-tab-data> ' +
          '<md-prev-button ' +
              'tabindex="-1" ' +
              'role="button" ' +
              'aria-label="Previous Page" ' +
              'aria-disabled="{{!$mdTabsCtrl.canPageBack()}}" ' +
              'ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageBack() }" ' +
              'ng-if="$mdTabsCtrl.shouldPaginate" ' +
              'ng-click="$mdTabsCtrl.previousPage()"> ' +
            '<md-icon md-svg-src="'+ $$mdSvgRegistry.mdTabsArrow +'"></md-icon> ' +
          '</md-prev-button> ' +
          '<md-next-button ' +
              'tabindex="-1" ' +
              'role="button" ' +
              'aria-label="Next Page" ' +
              'aria-disabled="{{!$mdTabsCtrl.canPageForward()}}" ' +
              'ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageForward() }" ' +
              'ng-if="$mdTabsCtrl.shouldPaginate" ' +
              'ng-click="$mdTabsCtrl.nextPage()"> ' +
            '<md-icon md-svg-src="'+ $$mdSvgRegistry.mdTabsArrow +'"></md-icon> ' +
          '</md-next-button> ' +
          '<md-tabs-canvas ' +
              'tabindex="{{ $mdTabsCtrl.hasFocus ? -1 : 0 }}" ' +
              'ng-focus="$mdTabsCtrl.redirectFocus()" ' +
              'ng-class="{ ' +
                  '\'md-paginated\': $mdTabsCtrl.shouldPaginate, ' +
                  '\'md-center-tabs\': $mdTabsCtrl.shouldCenterTabs ' +
              '}" ' +
              'ng-keydown="$mdTabsCtrl.keydown($event)"> ' +
            '<md-pagination-wrapper ' +
                'ng-class="{ \'md-center-tabs\': $mdTabsCtrl.shouldCenterTabs }" ' +
                'md-tab-scroll="$mdTabsCtrl.scroll($event)" ' +
                'role="tablist" ' +
                'aria-label="{{::$mdTabsCtrl.navigationHint}}">' +
              '<md-tab-item ' +
                  'tabindex="{{ tab.isActive() ? 0 : -1 }}" ' +
                  'class="md-tab {{::tab.scope.tabClass}}" ' +
                  'ng-repeat="tab in $mdTabsCtrl.tabs" ' +
                  'role="tab" ' +
                  'id="tab-item-{{::tab.id}}" ' +
                  'md-tab-id="{{::tab.id}}" ' +
                  'aria-selected="{{tab.isActive()}}" ' +
                  'aria-disabled="{{tab.scope.disabled || \'false\'}}" ' +
                  'ng-click="$mdTabsCtrl.select(tab.getIndex())" ' +
                  'ng-focus="$mdTabsCtrl.hasFocus = true" ' +
                  'ng-blur="$mdTabsCtrl.hasFocus = false" ' +
                  'ng-class="{ ' +
                      '\'md-active\':    tab.isActive(), ' +
                      '\'md-focused\':   tab.hasFocus(), ' +
                      '\'md-disabled\':  tab.scope.disabled ' +
                  '}" ' +
                  'ng-disabled="tab.scope.disabled" ' +
                  'md-swipe-left="$mdTabsCtrl.nextPage()" ' +
                  'md-swipe-right="$mdTabsCtrl.previousPage()" ' +
                  'md-tabs-template="::tab.label" ' +
                  'md-scope="::tab.parent"></md-tab-item> ' +
              '<md-ink-bar></md-ink-bar> ' +
            '</md-pagination-wrapper> ' +
            '<md-tabs-dummy-wrapper aria-hidden="true" class="md-visually-hidden md-dummy-wrapper"> ' +
              '<md-dummy-tab ' +
                  'class="md-tab" ' +
                  'tabindex="-1" ' +
                  'ng-focus="$mdTabsCtrl.hasFocus = true" ' +
                  'ng-blur="$mdTabsCtrl.hasFocus = false" ' +
                  'ng-repeat="tab in $mdTabsCtrl.tabs" ' +
                  'md-tabs-template="::tab.label" ' +
                  'md-scope="::tab.parent"></md-dummy-tab> ' +
            '</md-tabs-dummy-wrapper> ' +
          '</md-tabs-canvas> ' +
        '</md-tabs-wrapper> ' +
        '<md-tabs-content-wrapper ng-show="$mdTabsCtrl.hasContent && $mdTabsCtrl.selectedIndex >= 0" class="_md"> ' +
          '<md-tab-content ' +
              'id="{{:: $mdTabsCtrl.tabContentPrefix + tab.id}}" ' +
              'class="_md" ' +
              'role="tabpanel" ' +
              'aria-labelledby="tab-item-{{::tab.id}}" ' +
              'md-swipe-left="$mdTabsCtrl.swipeContent && $mdTabsCtrl.incrementIndex(1)" ' +
              'md-swipe-right="$mdTabsCtrl.swipeContent && $mdTabsCtrl.incrementIndex(-1)" ' +
              'ng-if="tab.hasContent" ' +
              'ng-repeat="(index, tab) in $mdTabsCtrl.tabs" ' +
              'ng-class="{ ' +
                '\'md-no-transition\': $mdTabsCtrl.lastSelectedIndex == null, ' +
                '\'md-active\':        tab.isActive(), ' +
                '\'md-left\':          tab.isLeft(), ' +
                '\'md-right\':         tab.isRight(), ' +
                '\'md-no-scroll\':     $mdTabsCtrl.dynamicHeight ' +
              '}"> ' +
            '<div ' +
                'md-tabs-template="::tab.template" ' +
                'md-connected-if="tab.isActive()" ' +
                'md-scope="::tab.parent" ' +
                'ng-if="$mdTabsCtrl.enableDisconnect || tab.shouldRender()"></div> ' +
          '</md-tab-content> ' +
        '</md-tabs-content-wrapper>';
    },
    controller:       'MdTabsController',
    controllerAs:     '$mdTabsCtrl',
    bindToController: true
  };
}
