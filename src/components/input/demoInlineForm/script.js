angular.module('inputInlineForm', ['ngMaterial', 'ngMessages'])
.controller('DemoCtrl', function ($scope) {
  $scope.user = {
    title: 'Developer',
    email: 'ipsum@lorem.com',
    firstName: '',
    lastName: '',
    company: 'Google',
    address: '1600 Amphitheatre Pkwy',
    city: 'Mountain View',
    state: null,
    stateOfBirth: 'CA',
    description: 'Loves TypeScript 💖',
    postalCode: '94043',
    licenseAccepted: true,
    submissionDate: null,
    marketingOptIn: true
  };

  $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
    'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
    'WY').split(' ').map(function (state) {
    return {abbrev: state};
  });
});
