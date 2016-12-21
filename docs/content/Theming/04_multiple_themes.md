@ngdoc content
@name Multiple Themes
@description

In most applications, declaring multiple themes is **not** necessary. Instead,
you should configure the `default` theme for your needs. If you need multiple
themes in a single application, Angular Material does provide tools
to make this possible.

### Registering another theme

Use the `$mdThemingProvider` to register a second theme within your application.
By default all themes will inherit from the `default` theme. Once you have
registered the second theme, you can configure it with the same chainable
interface used on the default theme.

<hljs lang="js">
angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('altTheme')
    .primaryPalette('purple') // specify primary color, all
                            // other color intentions will be inherited
                            // from default
});
</hljs>

### Using another theme

#### Via the Provider

You can change the default theme to be used across your entire application using
the provider:

<hljs lang="js">
$mdThemingProvider.setDefaultTheme('altTheme');
</hljs>

#### Via a Directive

Angular Material also exposes the `md-theme` directive which will set the theme
on an element and all child elements.

In the following example, the application will use the `default` theme, while
the second child `div` will use the `altTheme`. This allows you to theme
different parts of your application differently.

<hljs lang="html">
<div>
  <md-button class="md-primary">I will be blue (by default)</md-button>
  <div md-theme="altTheme">
    <md-button class="md-primary">I will be purple (altTheme)</md-button>
  </div>
</div>
</hljs>

#### Dynamic Themes

By default, to save on performance, theming directives will **not** watch
`md-theme` for changes. If you need themes to be dynamically modified, you will
need to use the `md-theme-watch` directive.

<hljs lang="html">
<div>
  <md-button ng-click="dynamicTheme = 'default'">Default</md-button>
  <md-button ng-click="dynamicTheme = 'altTheme'">altTheme</md-button>
  <div md-theme="{{ dynamicTheme }}" md-theme-watch>
    <md-button class="md-primary">I'm dynamic</md-button>
  </div>
</div>
</hljs>

If you need this behavior in your entire application (ie. on all `md-theme`
directives) you can use the `$mdThemingProvider` to enable it.

<hljs lang="js">
$mdThemingProvider.alwaysWatchTheme(true);
</hljs>

#### Lazy Generate Themes

By default, every theme is generated when defined. You can disable this in the
configuration section using the `$mdThemingProvider`.

<hljs lang="js">
angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {
  //disable theme generation
  $mdThemingProvider.generateThemesOnDemand(true);

  //themes are still defined in config, but the css is not generated
  $mdThemingProvider.theme('altTheme')
    .primaryPalette('purple')
    .accentPalette('green');
});
</hljs>

If you do this, you must generate the theme before using it using `$mdTheming`.

<hljs lang="js">
//generate the predefined theme named altTheme
$mdTheming.generateTheme('altTheme');
</hljs>

The theme name that is passed in must match the name of the theme that was
defined as part of the configuration block.
