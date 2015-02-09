
angular.module('iconDemo', ['ngMaterial'])
.controller('IconCtrl', function($scope, $http, $timeout) {
  $scope.sizes = [12, 14, 16, 18, 21, 24, 36, 48, 60, 72];
  $scope.limit = 10;
  $scope.color = '#00bcd4';
  $scope.iconType = 'Font';
  $scope.loading = true;

  var selectionMap = {
    'Font': {
      url: 'icons.json',
      callback: withFonts
    },
    'SVG': {
      url: 'core-icons.svg',
      callback: withSvgs
    }
  };

  $scope.$watch('iconType', function(type) {
    if (type) {
      $scope.reload(selectionMap[type]);
    }
  });

  $scope.reload = function(selection) {
    $scope.loading = true;
    $http.get(selection.url, { cache: true }).then(selection.callback).
      finally(function() { $scope.loading = false; });
  };

  $scope.loadMore = function(size) {
    size = size || 10;
    $scope.limit += size;
  };

  function withSvgs(response) {
    var icons = [];
    angular.forEach(angular.element(response.data).find('g'), function(g) {
      if (g.id.match(/^\d+/)) {
        console.warn(g.id + ' is not a valid selector');
      } else {
        icons.push({name: g.id});
      }
    });
    $scope.icons = icons;
  }

  function withFonts() {
    var fonts = [];
    var iconData = [
      {name: 'icon-3d-rotation', utf: '\\f101'},
      {name: 'icon-access-alarms', utf: '\\f102'},
      {name: 'icon-access-time', utf: '\\f103'},
      {name: 'icon-accessibility', utf: '\\f104'},
      {name: 'icon-account-balance', utf: '\\f105'},
      {name: 'icon-account-balance-wallet', utf: '\\f106'},
      {name: 'icon-account-box', utf: '\\f107'},
      {name: 'icon-account-child', utf: '\\f108'},
      {name: 'icon-account-circle', utf: '\\f109'},
      {name: 'icon-adb', utf: '\\f10a'},
      {name: 'icon-add', utf: '\\f10b'},
      {name: 'icon-add-alarm', utf: '\\f10c'},
      {name: 'icon-add-box', utf: '\\f10d'},
      {name: 'icon-add-circle', utf: '\\f10e'},
      {name: 'icon-add-circle-outline', utf: '\\f10f'},
      {name: 'icon-add-shopping-cart', utf: '\\f110'},
      {name: 'icon-add-to-photos', utf: '\\f111'},
      {name: 'icon-adjust', utf: '\\f112'},
      {name: 'icon-airplanemode-off', utf: '\\f113'},
      {name: 'icon-airplanemode-on', utf: '\\f114'},
      {name: 'icon-alarm', utf: '\\f115'},
      {name: 'icon-alarm-add', utf: '\\f116'},
      {name: 'icon-alarm-off', utf: '\\f117'},
      {name: 'icon-alarm-on', utf: '\\f118'}
    ];
    angular.forEach(iconData, function(icon) {
      fonts.push({name: icon.name, utf: icon.utf});
    });
    $scope.fonts = fonts;
  }
})
  .config(function($mdIconProvider) {
    $mdIconProvider.iconSet('social', 'social-icons.svg')
                   .defaultIconSet('core-icons.svg');
  });
