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
      $scope.printSelectedToppings = function printSelectedToppings(){
        // If there is more than one topping, we add an 'and' and an oxford
        // comma to be gramatically correct.
        if (this.selectedToppings.length > 1) {
          var lastTopping = ', and ' + this.selectedToppings.slice(-1)[0];
          return this.selectedToppings.slice(0,-1).join(', ') + lastTopping;
        }
        return this.selectedToppings.join('');
      };
    });
