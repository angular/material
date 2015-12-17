angular.module('tableDemo1', ['ngMaterial'])
  .controller('TableDemoController', function($scope) {

    $scope.items = [
      {
        name: 'Frozen yogurt',
        calories: 159,
        fat: 6.0,
        carbs: 24,
        protein: 4.0,
        sodium: 87,
        calcium: 14,
        iron: 1
      }, {
        name: 'Ice cream sandwhich',
        calories: 237,
        fat: 9.0,
        carbs: 37,
        protein: 4.3,
        sodium: 129,
        calcium: 8,
        iron: 1
      }, {
        name: 'Eclair',
        calories: 262,
        fat: 16.0,
        carbs: 24,
        protein: 6.0,
        sodium: 337,
        calcium: 6,
        iron: 7
      }
    ];

  });
