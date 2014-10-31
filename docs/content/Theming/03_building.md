@ngdoc content
@name Building Themes
@description

To build your own theme, you must write a `scss` file that overrides only the variables that you want to customize. 

The settings in your custom `scss` will override the settings in the `default-theme` to generate your custom theme. And using the conventions specified in [Material Colors](http://www.google.com/design/spec/style/color.html#color-ui-color-palette), developers can also [optionally] create 1-n **named** color palettes for use with Sass map().

- - -

For example, let's prepare a custom theme file `themes/my-custom-theme.scss`:

<hljs lang="js">
$theme-name: 'my-custom';

// Named color palettes

$my-color: (
  '50': #fde0dc,
  '100': #f9bdbb,
  '200': #f69988,
  '300': #f36c60,
  '400': #e84e40,
  '500': #e51c23,
  '600': #dd191d,
  '700': #d01716,
  '800': #c41411,
  '900': #b0120a,
  'A100': #ff7997,
  'A200': #ff5177,
  'A400': #ff2d6f,
  'A700': #e00032
);

$forest-green: (
  '50': #d0f8ce,
  '100': #a3e9a4,
  '200': #72d572,
  '300': #42bd41,
  '400': #2baf2b,
  '500': #259b24,
  '600': #0a8f08,
  '700': #0a7e07,
  '800': #056f00,
  '900': #0d5302,
  'A100': #a2f78d,
  'A200': #5af158,
  'A400': #14e715,
  'A700': #12c700
);

$primary-color-palette: $my-color;  // set the primary color palette for this theme
$background-color-base: #333;

$checkbox-color-palette: $forest-green; // set the 'forest green' theme for the checkbox only
$tabs-color-palette: $color-indigo; // set the 'indigo' theme for the tabs only
</hljs>

Then run the shell command `gulp build-theme -t my-custom`, or build everything with `gulp build`.
These commands will create css files in `/dist/themes` matching the sass files found in `/themes/`.

- - -

Now, in order to apply this custom theme to your application:

- Include the stylesheet in your html head:
  <p></p>
  <hljs lang="html">
  <link rel="stylesheet" href="themes/angular-material.css">
  <link rel="stylesheet" href="themes/my-custom-theme.css">
  </hljs>

- And set the `md-theme` attribute in your app's markup:
  <hljs lang="html">
  <div ng-app="myApp" md-theme="my-custom">

  </div>
  </hljs>
