(function() {
  'use strict';

  angular
      .module('popoverDemoBasicUsage', ['ngMaterial'])
      .controller('PopoverDemoCtrl', PopoverDemoCtrl);

  function PopoverDemoCtrl($mdPanel) {
    this.name = 'Brad Richardson';
  }
})();
