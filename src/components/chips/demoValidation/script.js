(function () {
  'use strict';
  angular
    .module('chipsValidationDemo', ['ngMaterial', 'ngMessages'])
    .controller('ChipsValidationCtrl', ValidationCtrl);

  function ValidationCtrl ($log) {
    this.selectedFruit = [];
    this.selectedVegetables = [];
    this.onSubmit = function(form) {
      $log.log({fruits: form.fruits.$modelValue, vegetables: form.vegetables.$modelValue});
    };
  }
})();
