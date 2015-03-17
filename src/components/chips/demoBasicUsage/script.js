(function () {
angular
    .module('contactchipsDemo', ['ngMaterial'])
    .controller('DemoCtrl', DemoCtrl);

function DemoCtrl ($timeout, $q) {
  var self = this;

  // Lists of fruit names and Vegetable objects
  self.fruitNames = ['Apple', 'Banana', 'Orange'];
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
  self.roFruitNames = angular.copy(self.fruitNames);
  self.roVegObjs = angular.copy(self.vegObjs);
}
})();
