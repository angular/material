angular
  .module('appDemoFontIconsWithClassnames', ['ngMaterial'])
  .controller('DemoCtrl', function($scope) {

    // Create list of font-icon names with color overrides
    var iconData = [
      { name: 'icon-home',          color: "#777" },
      { name: 'icon-user-plus',     color: "rgb(89, 226, 168)" },
      { name: 'icon-google-plus2',  color: "#A00" },
      { name: 'icon-youtube4',      color: "#00A" },
      { name: 'icon-settings',      color: "#A00", theme: "md-warn md-hue-5", spinable: true }
    ];

    // Create a set of sizes for the demo.
    $scope.sizes = [
      { size: 48, padding: 10 },
      { size: 36, padding: 6 },
      { size: 24, padding: 2 },
      { size: 12, padding: 0 }
    ];

    $scope.fonts = [].concat(iconData);

    $scope.shouldSpin = function(icon, size) {
      // 12px icons should not spin, because their ViewBox is not correctly applied.
      return $scope.isSpinning && icon.spinable && size != 12;
    } 
  })
  .config(function($mdThemingProvider) {
    // Update the theme colors to use themes on font-icons
    $mdThemingProvider
      .theme('default')
      .primaryPalette("red")
      .accentPalette('green')
      .warnPalette('blue');
  });
