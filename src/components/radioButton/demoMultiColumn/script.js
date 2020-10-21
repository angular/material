angular
  .module('radioMultiColumnDemo', ['ngMaterial'])
  .controller('ContactController', function($scope, $filter) {
    var self = this;

    self.contacts = [{
      'id': 1,
      'fullName': 'María Guadalupe',
      'lastName': 'Guadalupe',
      'title': "CEO, Found"
    }, {
      'id': 2,
      'fullName': 'Gabriel García Márquez',
      'lastName': 'Márquez',
      'title': "VP Sales & Marketing"
    }, {
      'id': 3,
      'fullName': 'Miguel de Cervantes',
      'lastName': 'Cervantes',
      'title': "Manager, Operations"
    }, {
      'id': 4,
      'fullName': 'Pacorro de Castel',
      'lastName': 'Castel',
      'title': "Security"
    }];
    self.selectedId = 2;
    self.selectedUser = function() {
      return $filter('filter')(self.contacts, { id: self.selectedId })[0].lastName;
    };
  });
