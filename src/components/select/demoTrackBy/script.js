(function() {
  'use strict';
  angular
    .module('selectDemoTrackBy', ['ngMaterial', 'ngMessages'])
    .controller('AppCtrl', function() {
      this.selectedItem = {
        id: '5a61e00',
        name: 'Bob',
        randomAddedProperty: 123
      };

      this.items = [
        {
          id: '5a61e00',
          name: 'Bob',
        },
        {
          id: '5a61e01',
          name: 'Max',
        },
        {
          id: '5a61e02',
          name: 'Alice',
        },
      ];
    });
})();
