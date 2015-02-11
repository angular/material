(function() {
'use strict';

angular.module('material.components.tabs')
  .directive('mdTabs', TabsDirective);

/**
 * @ngdoc directive
 * @name mdTabs
 * @module material.components.tabs
 *
 * @restrict E
 *
 * @description
 * The `<md-tabs>` directive serves as the container for 1..n `<md-tab>` child directives to produces a Tabs components.
 * In turn, the nested `<md-tab>` directive is used to specify a tab label for the **header button** and a [optional] tab view
 * content that will be associated with each tab button.
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
 * *  Any markup (other than **`<md-tab>`** tags) will be transcluded into the tab header area BEFORE the tab buttons.
 *
 * ### Explanation of tab stretching
 *
 * Initially, tabs will have an inherent size.  This size will either be defined by how much space is needed to accommodate their text or set by the user through CSS.  Calculations will be based on this size.
 *
 * On mobile devices, tabs will be expanded to fill the available horizontal space.  When this happens, all tabs will become the same size.
 *
 * On desktops, by default, stretching will never occur.
 *
 * This default behavior can be overridden through the `md-stretch-tabs` attribute.  Here is a table showing when stretching will occur:
 *
 * `md-stretch-tabs` | mobile    | desktop
 * ------------------|-----------|--------
 * `auto`            | stretched | ---
 * `always`          | stretched | stretched
 * `never`           | ---       | ---
 *
 * @param {integer=} md-selected Index of the active/selected tab
 * @param {boolean=} md-no-ink If present, disables ink ripple effects.
 * @param {boolean=} md-no-bar If present, disables the selection ink bar.
 * @param {string=}  md-align-tabs Attribute to indicate position of tab buttons: `bottom` or `top`; default is `top`
 * @param {string=} md-stretch-tabs Attribute to indicate whether or not to stretch tabs: `auto`, `always`, or `never`; default is `auto`
 *
 * @usage
 * <hljs lang="html">
 * <md-tabs md-selected="selectedIndex" >
 *   <img ng-src="img/angular.png" class="centered">
 *
 *   <md-tab
 *      ng-repeat="tab in tabs | orderBy:predicate:reversed"
 *      md-on-select="onTabSelected(tab)"
 *      md-on-deselect="announceDeselected(tab)"
 *      disabled="tab.disabled" >
 *
 *       <md-tab-label>
 *           {{tab.title}}
 *           <img src="img/removeTab.png"
 *                ng-click="removeTab(tab)"
 *                class="delete" >
 *       </md-tab-label>
 *
 *       {{tab.content}}
 *
 *   </md-tab>
 *
 * </md-tabs>
 * </hljs>
 *
 */
function TabsDirective($mdTheming) {
  return {
    restrict: 'E',
    controller: '$mdTabs',
    require: 'mdTabs',
    transclude: true,
    scope: {
      selectedIndex: '=?mdSelected'
    },
    template:
      '<section class="md-header" ' +
        'ng-class="{\'md-paginating\': pagination.active}">' +

        '<button class="md-paginator md-prev" ' +
          'ng-if="pagination.active && pagination.hasPrev" ' +
          'ng-click="pagination.clickPrevious()" ' +
          'aria-hidden="true">' +
          '<md-icon md-svg-icon="tabs-arrow"></md-icon>' +
        '</button>' +

        // overflow: hidden container when paginating
        '<div class="md-header-items-container" md-tabs-pagination>' +
          // flex container for <md-tab> elements
          '<div class="md-header-items">' +
            '<md-tabs-ink-bar></md-tabs-ink-bar>' +
          '</div>' +
        '</div>' +

        '<button class="md-paginator md-next" ' +
          'ng-if="pagination.active && pagination.hasNext" ' +
          'ng-click="pagination.clickNext()" ' +
          'aria-hidden="true">' +
          '<md-icon md-svg-icon="tabs-arrow"></md-icon>' +
        '</button>' +

      '</section>' +
      '<section class="md-tabs-content"></section>',
    link: postLink
  };

  function postLink(scope, element, attr, tabsCtrl, transclude) {

    scope.stretchTabs = attr.hasOwnProperty('mdStretchTabs') ? attr.mdStretchTabs || 'always' : 'auto';

    $mdTheming(element);
    configureAria();
    watchSelected();

    transclude(scope.$parent, function(clone) {
      angular.element(element[0].querySelector('.md-header-items')).append(clone);
    });

    function configureAria() {
      element.attr('role', 'tablist');
    }

    function watchSelected() {
      scope.$watch('selectedIndex', function watchSelectedIndex(newIndex, oldIndex) {
        if (oldIndex == newIndex) return;
        var rightToLeft = oldIndex > newIndex;
        tabsCtrl.deselect(tabsCtrl.itemAt(oldIndex), rightToLeft);

        if (tabsCtrl.inRange(newIndex)) {
          var newTab = tabsCtrl.itemAt(newIndex);
          while (newTab && newTab.isDisabled()) {
            newTab = newIndex > oldIndex 
                ? tabsCtrl.next(newTab)
                : tabsCtrl.previous(newTab);
          }
          tabsCtrl.select(newTab, rightToLeft);
        }
      });
    }
  }
}
})();
