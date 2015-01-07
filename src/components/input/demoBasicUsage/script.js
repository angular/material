angular.module('inputBasicDemo', ['ngMaterial'])

.controller('DemoCtrl', function($scope) {
  $scope.user = {
    title: 'Developer',
    email: 'ipsum@lorem.com',
    firstName: '',
    lastName: '' ,
    company: 'Google' ,
    address: '1600 Amphitheatre Pkwy' ,
    city: 'Mountain View' ,
    state: 'CA' ,
    country: 'USA' ,
    postalCode : '94043'
  };
});
