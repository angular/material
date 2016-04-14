angular
    .module('menuFilterDemo', ['ngMaterial'])
    .controller('menuFilterController', function($scope, $element) {
      var menuFilter = $element.find('md-menu-filter');
      var optGroup = $element.find('md-optgroup');

      // These functions make sure we can use the up and down arrows to interact
      // with the md-options below the md-filter-menu.
      optGroup.on('keydown', function(ev) {
        if (ev.keyCode == 38) {
          var container = angular.element(ev.currentTarget).parent().parent();
          var options = container.find('md-option');
          switch (document.activeElement) {
            case options[0]:
              container.find('md-menu-filter').find('input').focus();
              ev.stopPropagation();
              break;
            case options[1]:
              container.find('md-content')[0].scrollTop = 0;
              break;
            default:
              break;
          }
        }
      });
      menuFilter.on('keydown', function(ev) {
        // The md-select eats keydown events which would otherwise disallow users to
        // type in this directive's input unless this is present.
        if (ev.keyCode !== 27) {
          // We still want to close the dialog on esc
          ev.stopPropagation();
        }

        if (ev.keyCode == 40 && document.activeElement.tagName !== "MD-OPTION") {
          var container = angular.element(ev.currentTarget).parent().parent();
          var options = container.find('md-option');
          options[0] && options[0].focus();
          // This prevents the scrolling that normally happens with a down arrow
          // press.
          ev.preventDefault();
        }
      });
      this.drinks = ['Soda', 'Water', 'Sparkling Water', 'Juice', 'Milk'];
      this.filteredDrinks = [];
      this.searchTerm = '';
      this.clearSearch = function() {
        this.searchTerm = '';
      };
    });
