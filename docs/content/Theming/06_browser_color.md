@ngdoc content
@name Browser Colors
@description

<div class="layout_note">
  <span>This feature is for **mobile** devices only.</span>
</div>

![browser color](https://cloud.githubusercontent.com/assets/6004537/18006666/50519c7e-6ba9-11e6-905b-c3751c20549c.png)

This feature enables browser header theming using
[Material Design Colors](https://material.io/archive/guidelines/style/color.html#)
and the AngularJS Material theming system. For API details, please visit the
<a ng-href="api/service/$mdThemingProvider#enableBrowserColor">$mdThemingProvider</a> documentation.

For more information about this feature of mobile browsers, please visit
[Web Fundamentals](https://developers.google.com/web/fundamentals/design-and-ux/browser-customization/#color_browser_elements).

Below are usage examples for both the AngularJS configuration phase and during runtime.

### Config Phase
<hljs lang="js">
  myAppModule
    .config(function($mdThemingProvider) {
      // Enable browser color
      $mdThemingProvider.enableBrowserColor({
        theme: 'myTheme', // Default is 'default'
        palette: 'accent', // Default is 'primary', any basic material palette and extended palettes are available
        hue: '200' // Default is '800'
      });
    });
</hljs>

### Runtime
<hljs lang="js">
  myAppModule
    .controller('myCtrl', function($scope, $mdTheming) {
      var removeFunction = $mdTheming.setBrowserColor({
        theme: 'myTheme', // Default is 'default'
        palette: 'accent', // Default is 'primary', any basic material palette and extended palettes are available
        hue: '200' // Default is '800'
      });
      
      $scope.$on('$destroy', function () {
        removeFunction(); // COMPLETELY removes the browser color
      })
    })
</hljs>

