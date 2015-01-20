
angular.module('iconDemo', ['ngMaterial'])
.controller('IconCtrl', function($scope, $http, $timeout) {
  $scope.sizes = [12, 14, 16, 18, 21, 24, 36, 48, 60, 72];
  $scope.limit = 10;
  $scope.color = "#0000ff"

  $http.get('icons.json').then(function(response) {
    $scope.icons = response.data;
  })

  $scope.loadMore = function(size) {
    size = size || 100;
    $scope.limit += size;
  }
})
// .config(function($mdIcon) {
//   $mdIcon.registerIcon('menu-svg', 'test.svg');
// });

