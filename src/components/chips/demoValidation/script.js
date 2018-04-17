(function () {
  'use strict';
  angular
    .module('chipsValidationDemo', ['ngMaterial', 'ngMessages'])
    .controller('ChipsValidationCtrl', ValidationCtrl);

  function ValidationCtrl () {
    this.selectedFruit = [];
    this.selectedVegetables = [];
  }
})();
