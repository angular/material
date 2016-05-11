angular
    .module('selectDemoOptGroups', ['ngMaterial'])
    .controller('SelectOptGroupController', function($scope) {
      $scope.sizes = [
          "small (12-inch)",
          "medium (14-inch)",
          "large (16-inch)",
          "insane (42-inch)"
      ];
      $scope.toppings = [
        { category: 'meat', name: 'Pepperoni' },
        { category: 'meat', name: 'Sausage' },
        { category: 'meat', name: 'Ground Beef' },
        { category: 'meat', name: 'Bacon' },
        { category: 'veg', name: 'Mushrooms' },
        { category: 'veg', name: 'Onion' },
        { category: 'veg', name: 'Green Pepper' },
        { category: 'veg', name: 'Green Olives' }
      ];
      $scope.selectedToppings = [];
      $scope.printSelectedToppings = function printSelectedToppings() {
        var numberOfToppings = this.selectedToppings.length;

        // If there is more than one topping, we add an 'and'
        // to be gramatically correct. If there are 3+ toppings
        // we also add an oxford comma.
        if (numberOfToppings > 1) {
          var needsOxfordComma = numberOfToppings > 2;
          var lastToppingConjunction = (needsOxfordComma ? ',' : '') + ' and ';
          var lastTopping = lastToppingConjunction +
              this.selectedToppings[this.selectedToppings.length - 1];
          return this.selectedToppings.slice(0, -1).join(', ') + lastTopping;
        }

        return this.selectedToppings.join('');
      };
    });
