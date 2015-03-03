angular
  .module('inputIconDemo', ['ngMaterial', 'ngMessages'])
  .controller('DemoCtrl', function($scope) {
    $scope.user = {
      name: 'John Doe',
      email: 'ipsum@lorem.com',
      phone: '',
      address: ''
    };
  });
