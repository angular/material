
angular.module('appDemoSvgIcons', ['ngMaterial'])
.controller('DemoCtrl', function( $scope ) {

    $scope.insertDriveIconURL = 'img/icons/ic_insert_drive_file_24px.svg';
    $scope.getAndroid = function() {
      return 'img/icons/android.svg';
    }
});
