angular
  .module('tableDemo1', ['ngMaterial'])
  .controller('AppCtrl', TableDemoCtrl);

function TableDemoCtrl($log) {

  this.options = {
    auto: false,
    multiple: false,
    rowSelection: true
  };

  this.order = 'calories';

  this.desserts = [{
    'name': 'Frozen yogurt',
    'type': 'Ice cream',
    'calories': 159.0,
    'fat': 6.0,
    'carbs': 24.0,
    'protein': 4.0,
    'sodium': 87.0,
    'calcium': 14.0,
    'iron': 1.0
  }, {
    'name': 'Ice cream sandwich',
    'type': 'Ice cream',
    'calories': 237.0,
    'fat': 9.0,
    'carbs': 37.0,
    'protein': 4.3,
    'sodium': 129.0,
    'calcium': 8.0,
    'iron': 1.0
  }, {
    'name': 'Eclair',
    'type': 'Pastry',
    'calories':  262.0,
    'fat': 16.0,
    'carbs': 24.0,
    'protein':  6.0,
    'sodium': 337.0,
    'calcium':  6.0,
    'iron': 7.0
  }, {
    'name': 'Cupcake',
    'type': 'Pastry',
    'calories':  305.0,
    'fat': 3.7,
    'carbs': 67.0,
    'protein': 4.3,
    'sodium': 413.0,
    'calcium': 3.0,
    'iron': 8.0
  }, {
    'name': 'Jelly bean',
    'type': 'Candy',
    'calories':  375.0,
    'fat': 0.0,
    'carbs': 94.0,
    'protein': 0.0,
    'sodium': 50.0,
    'calcium': 0.0,
    'iron': 0.0
  }, {
    'name': 'Lollipop',
    'type': 'Candy',
    'calories': 392.0,
    'fat': 0.2,
    'carbs': 98.0,
    'protein': 0.0,
    'sodium': 38.0,
    'calcium': 0.0,
    'iron': 2.0
  }, {
    'name': 'Honeycomb',
    'type': 'Other',
    'calories': 408.0,
    'fat': 3.2,
    'carbs': 87.0,
    'protein': 6.5,
    'sodium': 562.0,
    'calcium': 0.0,
    'iron': 45.0
  }, {
    'name': 'Donut',
    'type': 'Pastry',
    'calories': 452.0,
    'fat': 25.0,
    'carbs': 51.0,
    'protein': 4.9,
    'sodium': 326.0,
    'calcium': 2.0,
    'iron': 22.0
  }, {
    'name': 'KitKat',
    'type': 'Candy',
    'calories': 518.0,
    'fat': 26.0,
    'carbs': 65.0,
    'protein': 7.0,
    'sodium': 54.0,
    'calcium': 12.0,
    'iron': 6.0
  }];

  this.selected = angular.copy(this.desserts[3]);

  this.onDeselect = function (dessert) {
    $log.info('Table: Deselected ' + dessert.name);
  };

  this.onSelect = function (dessert) {
    $log.info('Table: Selected ' + dessert.name);
  };

  this.trackBy = function (dessert) {
    return dessert.name;
  };
}
