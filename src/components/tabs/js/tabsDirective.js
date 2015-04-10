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
 * Additional features also include:
 *
 * *  Content can include any markup.
 * *  If a tab is disabled while active/selected, then the next tab will be auto-selected.
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
 * @param {boolean=} md-dynamic-height When enabled, the tab wrapper will resize based on the contents of the selected tab
 * @param {boolean=} md-center-tabs When enabled, tabs will be centered provided there is no need for pagination
 * @param {boolean=} md-no-pagination When enabled, pagination will remain off
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
 *     <md-tab-template>
 *       {{tab.content}}
 *     </md-tab-template>
 *   </md-tab>
 * </md-tabs>
 * </hljs>
 *
 */

(function () {
  'use strict';

  angular
      .module('material.components.tabs')
      .directive('mdTabs', MdTabs);

  function MdTabs ($mdTheming) {
    return {
      scope: {
        noPagination:  '=?mdNoPagination',
        dynamicHeight: '=?mdDynamicHeight',
        centerTabs:    '=?mdCenterTabs',
        selectedIndex: '=?mdSelected',
        stretchTabs: '@?mdStretchTabs'
      },
      transclude: true,
      template: '\
        <md-tabs-wrapper ng-class="{ \'md-stretch-tabs\': $mdTabsCtrl.shouldStretchTabs() }">\
          <md-tab-data ng-transclude></md-tab-data>\
          <md-prev-button\
              tabindex="-1"\
              role="button"\
              aria-label="Previous Page"\
              aria-disabled="{{!$mdTabsCtrl.canPageBack()}}"\
              ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageBack() }"\
              ng-if="$mdTabsCtrl.shouldPaginate()"\
              ng-click="$mdTabsCtrl.previousPage()">\
            <md-icon md-svg-icon="tabs-arrow"></md-icon>\
          </md-prev-button>\
          <md-next-button\
              tabindex="-1"\
              role="button"\
              aria-label="Next Page"\
              aria-disabled="{{!$mdTabsCtrl.canPageForward()}}"\
              ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageForward() }"\
              ng-if="$mdTabsCtrl.shouldPaginate()"\
              ng-click="$mdTabsCtrl.nextPage()">\
            <md-icon md-svg-icon="tabs-arrow"></md-icon>\
          </md-next-button>\
          <md-tabs-canvas\
              tabindex="0"\
              aria-activedescendant="tab-item-{{$mdTabsCtrl.tabs[$mdTabsCtrl.focusIndex].id}}"\
              ng-focus="$mdTabsCtrl.redirectFocus()"\
              ng-class="{ \'md-paginated\': $mdTabsCtrl.shouldPaginate() }"\
              ng-keydown="$mdTabsCtrl.keydown($event)"\
              role="tablist">\
            <md-pagination-wrapper\
                ng-class="{ \'md-center-tabs\': $mdTabsCtrl.shouldCenterTabs() }"\
                md-tab-scroll="$mdTabsCtrl.scroll($event)">\
              <md-tab-item\
                  tabindex="-1"\
                  class="md-tab"\
                  style="max-width: {{ tabWidth ? tabWidth + \'px\' : \'none\' }}"\
                  role="tab"\
                  aria-selected="{{tab.isActive()}}"\
                  aria-disabled="{{tab.scope.disabled}}"\
                  aria-controls="tab-content-{{tab.id}}"\
                  ng-repeat="tab in $mdTabsCtrl.tabs"\
                  ng-click="$mdTabsCtrl.select(tab.getIndex())"\
                  ng-class="{\
                      \'md-active\':    tab.isActive(),\
                      \'md-focus\':     tab.hasFocus(),\
                      \'md-disabled\':  tab.scope.disabled\
                  }"\
                  ng-disabled="tab.scope.disabled"\
                  md-swipe-left="$mdTabsCtrl.nextPage()"\
                  md-swipe-right="$mdTabsCtrl.previousPage()"\
                  md-label-template="tab.label"></md-tab-item>\
              <md-ink-bar ng-hide="noInkBar"></md-ink-bar>\
            </md-pagination-wrapper>\
            <div class="md-visually-hidden">\
              <md-dummy-tab\
                  tabindex="-1"\
                  id="tab-item-{{tab.id}}"\
                  role="tab"\
                  aria-controls="tab-content-{{tab.id}}"\
                  aria-selected="{{tab.isActive()}}"\
                  aria-disabled="{{tab.scope.disabled}}"\
                  ng-focus="$mdTabsCtrl.hasFocus = true"\
                  ng-blur="$mdTabsCtrl.hasFocus = false"\
                  ng-repeat="tab in $mdTabsCtrl.tabs"\
                  md-label-template="tab.label"></md-dummy-tab>\
            </div>\
          </md-tabs-canvas>\
        </md-tabs-wrapper>\
        <md-tabs-content-wrapper ng-show="$mdTabsCtrl.hasContent">\
          <md-tab-content\
              id="tab-content-{{tab.id}}"\
              role="tabpanel"\
              aria-labelledby="tab-item-{{tab.id}}"\
              md-tab-data="tab"\
              md-swipe-left="$mdTabsCtrl.incrementSelectedIndex(1)"\
              md-swipe-right="$mdTabsCtrl.incrementSelectedIndex(-1)"\
              ng-if="$mdTabsCtrl.hasContent"\
              ng-repeat="(index, tab) in $mdTabsCtrl.tabs" \
              ng-class="{\
                \'md-no-transition\': $mdTabsCtrl.lastSelectedIndex == null,\
                \'md-active\':        tab.isActive(),\
                \'md-left\':          tab.isLeft(),\
                \'md-right\':         tab.isRight(),\
                \'md-no-scroll\':     dynamicHeight\
              }"></md-tab-content>\
        </md-tabs-content-wrapper>\
      ',
      controller: 'MdTabsController',
      controllerAs: '$mdTabsCtrl',
      link: function (scope, element, attr) {
        angular.forEach(scope.$$isolateBindings, function (binding, key) {
          if (binding.optional && angular.isUndefined(scope[key])) {
            scope[key] = attr.hasOwnProperty(attr.$normalize(binding.attrName));
          }
        });
        //-- watch attributes
        attr.$observe('mdNoBar', function (value) { scope.noInkBar = angular.isDefined(value); });
        //-- set default value for selectedIndex
        scope.selectedIndex = angular.isNumber(scope.selectedIndex) ? scope.selectedIndex : 0;
        //-- apply themes
        $mdTheming(element);
      }
    };
  }
})();