@ngdoc content
@name Building Themes
@description

To build your own theme, you must write a `scss` file that overrides only the variables that you want to customize. These will override settings in the `default-theme` to generate your custom theme.

Developers can also optionally create a **named** color palette with a Sass map; following conventions found in the spec: http://www.google.com/design/spec/style/color.html#color-ui-color-palette. For example, let's prepare a custom theme file `themes/my-custom-theme.scss`:

<hljs lang="js">
$theme-name: 'my-custom';

// Named color palette
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
$primary-color-palette: $my-color;
$background-color-base: #333;

$checkbox-color-palette: $color-pink; // set the theme for the checkbox only
$tabs-color-palette: $color-indigo; // set the theme for the tabs only
</hljs>

Then run the shell command `gulp build-theme -t my-custom`, or build everything with `gulp build`.
<br/>These commands will create css files in `/dist/themes` matching the sass files found in `/themes/`.

To apply a theme your application:

- Include the stylesheet in your html head:
  <p></p>
  <hljs lang="html">
  <link rel="stylesheet" href="themes/my-custom-theme.css">
  </hljs>

- And set the `md-theme` attribute in your app's markup:
  <hljs lang="html">
  <div ng-app="myApp" md-theme="my-custom">
    ...my app...
  </div>
  </hljs>
