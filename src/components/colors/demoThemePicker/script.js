angular
  .module('colorsThemePickerDemo', ['ngMaterial'])
  .controller('ThemeDemoCtrl', function ($scope, $mdColorPalette) {
    $scope.colors = Object.keys($mdColorPalette);
    
    $scope.primary = 'purple';
    $scope.accent = 'green';

    $scope.isPrimary = true;

    $scope.selectTheme = function (color) {
      if ($scope.isPrimary) {
        $scope.primary = color;

        $scope.isPrimary = false;
      }
      else {
        $scope.accent = color;

        $scope.isPrimary = true;
      }
    };
  })
  .directive('themePreview', function () {
    return {
      restrict: 'E',
      templateUrl: 'themePreview.tmpl.html',
      scope: {
        primary: '=',
        accent: '='
      },
      controller: function ($scope, $mdColors, $mdColorUtil) {
        $scope.getColor = function (color) {
          return $mdColorUtil.rgbaToHex($mdColors.getThemeColor(color))
        };
      }
    }
  });