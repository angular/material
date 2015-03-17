(function () {
angular
    .module('contactchipsDemo', ['ngMaterial'])
    .controller('DemoCtrl', DemoCtrl);

function DemoCtrl ($timeout, $q) {
  var self = this;

  self.readonly = false;

  // Lists of fruit names and Vegetable objects
  self.fruitNames = ['Apple', 'Banana', 'Orange'];
  self.roFruitNames = angular.copy(self.fruitNames);
  self.newFruitNames = [];
  self.vegObjs = [
    {
      'name' : 'Broccoli',
      'type' : 'cruciferous'
    },
    {
      'name' : 'Cabbage',
      'type' : 'cruciferous'
    },
    {
      'name' : 'Carrot',
      'type' : 'root'
    }
  ];

  self.newVeg = function(chip) {
    return {
      name: chip,
      type: 'unknown'
    };
  };
}
})();
