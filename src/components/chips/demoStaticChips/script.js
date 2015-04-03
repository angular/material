(function () {
  'use strict';
  angular
      .module('staticChipsDemo', ['ngMaterial'])
      .controller('DemoCtrl', DemoCtrl);

  function DemoCtrl ($timeout, $q) {
    this.chipText = 'Football';
  }
})();
