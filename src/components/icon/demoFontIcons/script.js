
angular.module('appDemoFontIcons', ['ngMaterial'])
.controller('DemoCtrl', function( $scope ) {
    // Create list of font-icon names with color overrides
    var iconData = [
          {name: 'icon-home'        , color: "#777" },
          {name: 'icon-user-plus'   , color: "rgb(89, 226, 168)" },
          {name: 'icon-google-plus2', color: "#A00" },
          {name: 'icon-youtube4'    , color:"#00A" },
          {name: 'icon-settings'    , color:"black" }
        ];

    // Create a set of sizes...
    $scope.sizes = [12, 21, 36, 48];
    $scope.fonts = [].concat(iconData);

});
