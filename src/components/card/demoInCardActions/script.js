
angular.module('cardDemo3', ['ngMaterial'])

.config(['$mdIconProvider', function($mdIconProvider) {
  $mdIconProvider.icon('md-toggle-arrow', 'img/icons/toggle-arrow.svg', 48);
}])
.controller('AppCtrl', function($scope) {
  $scope.imagePath = 'img/washedout.png';
});
