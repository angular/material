@ngdoc content
@name Configuring a Theme
@description

## Configuring a theme

By default, your AngularJS Material application will use the default theme, a theme
that is pre-configured with the following palettes for intention groups:

- *primary* - indigo
- *accent* - pink
- *warn* - red
- *background* - grey

Configuring of the default theme is done by using the `$mdThemingProvider`
during application configuration.

### Configuring Color Intentions

You can specify a color palette for a given color intention by calling the
appropriate configuration method (`theme.primaryPalette`, `theme.accentPalette`,
`theme.warnPalette`, `theme.backgroundPalette`).

<hljs lang="js">
angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('pink')
    .accentPalette('orange');
});
</hljs>

### Specifying Dark Themes

You can mark a theme as dark by calling `theme.dark()`. 

<hljs lang="js">
angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .dark();
});
</hljs>

### Specifying Custom Hues For Color Intentions

You can specify the hues from a palette that will be used by an intention group
by default and for the `md-hue-1`, `md-hue-2`, `md-hue-3` classes. 

By default, shades `500`, `300` `800` and `A100` are used for `primary` and
`warn` intentions, while `A200`, `A100`, `A400` and `A700` are used for `accent`.

<hljs lang="js">
angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {

  $mdThemingProvider.theme('default')
    .primaryPalette('pink', {
      'default': '400', // by default use shade 400 from the pink palette for primary intentions
      'hue-1': '100', // use shade 100 for the `md-hue-1` class
      'hue-2': '600', // use shade 600 for the `md-hue-2` class
      'hue-3': 'A100' // use shade A100 for the `md-hue-3` class
    })
    // If you specify less than all of the keys, it will inherit from the
    // default shades
    .accentPalette('purple', {
      'default': '200' // use shade 200 for default, and keep all other shades the same
    });

});
</hljs>

### Defining Custom Palettes

As mentioned before, AngularJS Material ships with the Material Design Spec's color palettes built
in. In the event that you need to define a custom color palette, you can use `$mdThemingProvider`
to define it. This makes the palette available to your theme for use in its intention groups.
Note that you must specify all hues in the definition map. If you only want to override a few hues,
please extend a palette (above).

For a dark colored, custom palette, you should specify the default contrast color as  `light`.
For lighter hues in the palette, you may need to add them to the list of `contrastDarkColors` to
meet contrast guidelines. Similarly, you may need to add darker hues to `contrastStrongLightColors`,
which has been updated to the latest Material Design guidelines for
[Color Usability](https://material.io/archive/guidelines/style/color.html#color-usability).
The update to the guidelines changed primary text on dark backgrounds from 87% to 100% opacity.

<hljs lang="js">
angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {

  $mdThemingProvider.definePalette('amazingDarkPaletteName', {
    '50': 'ffebee',
    '100': 'ffcdd2',
    '200': 'ef9a9a',
    '300': 'e57373',
    '400': 'ef5350',
    '500': 'f44336',
    '600': 'e53935',
    '700': 'd32f2f',
    '800': 'c62828',
    '900': 'b71c1c',
    'A100': 'ff8a80',
    'A200': 'ff5252',
    'A400': 'ff1744',
    'A700': 'd50000',
    // By default, text (contrast) on this palette should be white with 87% opacity.
    'contrastDefaultColor': 'light',
    // By default, for these lighter hues, text (contrast) should be 'dark'.
    'contrastDarkColors': '50 100 200 300 400 500 600 A100 A200 A400',
    // By default, for these darker hues, text (contrast) should be white with 100% opacity.
    'contrastStrongLightColors': '700 800 900 A700'
  });

  $mdThemingProvider.theme('default')
    .primaryPalette('amazingDarkPaletteName')
});
</hljs>

For a light colored, custom palette, you should specify the default contrast color as `dark`.
Then `contrastStrongLightColors` can be used if any hues are too dark for dark text.

<hljs lang="js">
angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {

  $mdThemingProvider.definePalette('amazingLightPaletteName', {
    '50': '#f1f8e9',
    '100': '#dcedc8',
    '200': '#c5e1a5',
    '300': '#aed581',
    '400': '#9ccc65',
    '500': '#8bc34a',
    '600': '#7cb342',
    '700': '#689f38',
    '800': '#558b2f',
    '900': '#33691e',
    'A100': '#ccff90',
    'A200': '#b2ff59',
    'A400': '#76ff03',
    'A700': '#64dd17',
    // By default, text (contrast) on this palette should be dark with 87% opacity.
    'contrastDefaultColor': 'dark',
    // By default, for these darker hues, text (contrast) should be white with 100% opacity.
    'contrastStrongLightColors': '800 900'
  });

  $mdThemingProvider.theme('default')
    .accentPalette('amazingLightPaletteName')
});
</hljs>

### Extending Existing Palettes

Sometimes it is easier to extend an existing color palette to change a few properties
than to define a whole new palette. You can use `$mdThemingProvider.extendPalette` 
to quickly extend an existing color palette.

<hljs lang="js">
angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {

  // Extend the red theme with a different color and make the contrast color black instead of white.
  // For example: raised button text will be black instead of white.
  var neonRedMap = $mdThemingProvider.extendPalette('red', {
    '500': '#ff0000',
    'contrastDefaultColor': 'dark'
  });

  // Register the new color palette map with the name `neonRed`
  $mdThemingProvider.definePalette('neonRed', neonRedMap);

  // Use that theme for the primary intentions
  $mdThemingProvider.theme('default')
    .primaryPalette('neonRed');

});
</hljs>

### Disable Theming

You can disable theming by calling `disableTheming()`.

<hljs lang="js">
angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.disableTheming();
});
</hljs>

