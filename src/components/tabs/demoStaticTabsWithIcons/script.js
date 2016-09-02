(function () {
  'use strict';

  angular
      .module('tabsDemoStaticTabs', ['ngMaterial'] )
      .controller('AppCtrl', AppCtrl)
	  .config(function($mdThemingProvider){

		$mdThemingProvider.definePalette('canc4isrPrimaryPalette',{
			'50': 'ffffff',
			'100': 'ffffff',
			'200': 'ffffff',
			'300': 'ffffff',
			'400': 'ffffff',
			'500': '40484c',
			'600': '40c4ff',
			'700': 'ffffff',
			'800': 'ffffff',
			'900': 'ffffff',
			'A100': '40c4ff',
			'A200': '40c4ff',
			'A400': '40c4ff',
			'A700': '40c4ff',		
			'contrastDefaultColor': 'light',
			'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
			'contrastLightColors': ['50', '100', '200', '300', '400', 'A100'],			
		});
		$mdThemingProvider.definePalette('canc4isrAccentPalette',{
			'50': 'ffffff',
			'100': 'ffffff',
			'200': 'ffffff',
			'300': 'ffffff',
			'400': 'ffffff',
			'500': '40484c',
			'600': 'ffffff',
			'700': 'ffffff',
			'800': 'ffffff',
			'900': 'ffffff',
			'A100': 'ffffff',
			'A200': '40c4ff',
			'A400': 'ffffff',
			'A700': 'ffffff',	
			'contrastDefaultColor': 'light',
			'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
			'contrastLightColors': ['50', '100', '200', '300', '400', 'A100'],
		});	  
	  
		$mdThemingProvider.theme('default')
			  .primaryPalette('canc4isrPrimaryPalette')
			  .accentPalette('canc4isrAccentPalette');
	  });;

  function AppCtrl ( $scope ) {
    $scope.data = {
      selectedIndex: 0,
      secondLocked:  false,
      secondLabel:   "Item Two",
      bottom:        false
    };
    $scope.next = function() {
      $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2) ;
    };
    $scope.previous = function() {
      $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    };
  }


  
})();
