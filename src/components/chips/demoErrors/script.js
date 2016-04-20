(function () {
  'use strict';
  angular
      .module('chipsErrorsDemo', ['ngMaterial', 'ngMessages'])
      .controller('ChipsErrorsCtrl', DemoCtrl);

  function DemoCtrl () {
    this.selectedFruit = [];
    this.selectedVegetables = [];
  }
})();
