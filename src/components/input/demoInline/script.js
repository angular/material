angular
  .module('inputInlineDemo', ['ngMaterial', 'ngMessages'])
  .controller('DemoCtrl', function($scope, $timeout) {
    $scope.user = {
      name: 'John Doe',
      foods: ['Cookies', 'Cake', 'Ice Cream']
    };

    // TODO - Remove before live code; just scrolls my demo into position
    $timeout(function() {
      document.body.querySelector('md-content[md-scroll-y]').scrollTop = 10000;
    }, 1000);
  });
