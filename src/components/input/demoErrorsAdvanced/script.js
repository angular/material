angular.module('inputErrorsAdvancedApp', ['ngMaterial', 'ngMessages'])

  .controller('AppCtrl', function($scope) {
    $scope.showHints = true;

    $scope.user = {
      name: "",
      email: "",
      social: "123456789",
      phone: "N/A"
    };
  });
