/**
 * @ngdoc module
 * @name material.components.menuFilter
 */

angular.module('material.components.menuFilter', [
  'material.core',
])
  .directive('mdMenuFilter', MdMenuFilterDirective);

/**
 * @ngdoc directive
 * @name mdMenuFilter
 * @module material.components.menuFilter
 * @restrict E
 *
 * @description
 * The menu filter directive is used to make adding a searchbar to
 * the top of a component quick and painless.
 *
 * @param {string=} aria-label Optional label for accessibility. Only necessary if no placeholder or
 *   explicit label is present.
 * @param {Array=} items The items to filter. This is an input, it will act as a
 *   list of items to display when there is no search term and to filter through
 *   when a search term is present.
 * @param {Array=} filtered-items The variable the filtered results will be stored in.
 *  This will be overwritten with the values in the 'items' array that substring
 *  match the 'ng-model' every time the 'ng-model' is updated.
 *  every time the ng-model is changed.
 * @param {string} ng-model Assignable angular expression to data-bind the
 *   search term to, this is the variable the directive watches and triggers
 *   filtering on.
 * @param {string=} placeholder Placeholder hint text.
 * @param {string=} tabindex Optional tab-index for accessibility.
 *
 * @usage
 * <hljs lang="html">
 *  <md-menu-filter items="ctrl.items"
 *                  placeholder="Select an item.."
 *                  filtered-items="ctrl.filteredItems"
 *                  ng-model="ctrl.searchTerm"
 *                  tabindex="1"
 *                  aria-label="search box">
 *  </md-menu-filter>
 * </hljs>
 *
 * Please Note: When using this in the context of of an md-select directive w/
 * the 'multiple' attribute enabled - this component cannot detect when that
 * select menu closes. If the developer does not clear the ng-model on close,
 * the closed menu will only display the filtered results (although the actual
 * options selected may range beyond what is currently being filtered). An
 * example of how one might clear the ng-model on close is provided in the basic
 * demo.
 */
function MdMenuFilterDirective($mdTheming, $mdAria) {
  return {
    restrict: 'E',
    template: '<input ng-model="searchTerm" type="search"' +
        'class="md-menu-filter _md-text">' +
            '<button' +
                ' type="button"' +
                ' tabindex="-1"' +
                ' ng-if="searchTerm"' +
                ' class="_md-search-clear-button"' +
                ' ng-click="clear()">' +
              '<md-icon md-svg-icon="md-close"></md-icon>' +
              '<span class="_md-visually-hidden">Clear</span>' +
            '</button>',
    scope: {
      filteredItems: '=',
      items: '=',
      ngModel: '=',
      ariaLabel: '@?',
      placeholder: '@?',
      tabindex: '@?',
    },
    link: link
  };

  function link(scope, element, attr) {
    var ngModel = element.controller('ngModel');

    $mdTheming(element);

    init();

    function init() {
      // This is for the clear button that appears when there is a search term.
      scope.clear = function() {
        scope.searchTerm = '';
      };

      var tabindex = (attr.tabindex >= 0) ? attr.tabindex : '-1';

      // Set our tabindex of the md-menu-filter directive to -1 by default,
      // because the select/menu input will hold the actual tabindex.
      element.find('input').attr('tabindex', tabindex);

      initNgModel();
      initTextAttributes();
    }

    function initNgModel() {
      scope.$watch('searchTerm', function(item) {
        ngModel.$setViewValue(item);
        filterResults(item);
      });

      ngModel.$render = function() {
        scope.searchTerm = ngModel.$modelValue;
      };
    }

    function initTextAttributes() {
      var labelText = element.attr('aria-label');
      var placeholder = element.attr('placeholder');

      if (placeholder) {
        element.find('input').attr('placeholder', placeholder);
      }

      if (labelText) {
        element.attr('aria-label', labelText);
      } else {
        placeholder && element.attr('aria-label', placeholder);
        $mdAria.expect(element, 'aria-label', element.attr('placeholder'));
      }
    }

    function filterResults(query) {
      if (query)  {
        var results = [];
        query = query.toLowerCase();
        for (var i = 0; i < scope.items.length; i++) {
          var item = scope.items[i];
          if (item.toString().toLowerCase().indexOf(query) > -1) {
            results.push(item);
          }
        }
        scope.filteredItems = results;
      } else {
        scope.filteredItems = scope.items;
      }
    }
  }
}
