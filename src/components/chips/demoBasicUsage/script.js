(function () {
  'use strict';
  angular
      .module('chipsDemo', ['ngMaterial', 'ngMessages'])
      .config(['$mdIconProvider', function($mdIconProvider) {
        $mdIconProvider.icon('md-close', 'img/icons/ic_close_24px.svg', 24);
      }])
      .controller('BasicDemoCtrl', DemoCtrl);

  function DemoCtrl ($timeout, $q, $log) {
    var self = this;

    self.readonly = false;

    // Lists of fruit names and Vegetable objects
    self.fruitNames = ['Apple', 'Banana', 'Orange'];
    self.ngChangeFruitNames = angular.copy(self.fruitNames);
    self.roFruitNames = angular.copy(self.fruitNames);
    self.editableFruitNames = angular.copy(self.fruitNames);

    self.tags = [];
    self.vegObjs = [
      {
        'name' : 'Broccoli',
        'type' : 'Brassica'
      },
      {
        'name' : 'Cabbage',
        'type' : 'Brassica'
      },
      {
        'name' : 'Carrot',
        'type' : 'Umbelliferous'
      }
    ];

    self.newVeg = function(chip) {
      return {
        name: chip,
        type: 'unknown'
      };
    };

    self.onModelChange = function(newModel) {
      $log.log('The model has changed to ' + newModel + '.');
    };
  }
})();
