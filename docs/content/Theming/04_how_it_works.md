@ngdoc content
@name How it Works
@description

Themes are implemented through a combination of Sass and JavaScript.

#### Color Palettes

Angular Material has implemented the spec's [color palettes](http://www.google.com/design/spec/style/color.html#color-ui-color-palette) as Sass maps in [src/core/style/color-palette.scss](https://github.com/angular/material/blob/master/src/core/style/color-palette.scss). 

The palettes can be used in your own theme by calling Sass's `map-get` function:

<hljs lang="css">
body {
	background-color: map-get($color-red, '500');
}
</hljs>

#### Global Style Variables

Most components' colors are derived from variables in [src/core/style/variables.scss](https://github.com/angular/material/blob/master/src/core/style/variables.scss). Here are some guidelines regarding these variables:

| Variable | Purpose |
|--------|--------|
| $theme-name | name of the theme, matching what will be used in the `md-theme` attribute |
| $foreground-color-palette | the color palette used for foreground colors (such as text, hints, and dividers) |
| $background-color-palette | the color palette used to determine the background color |
| $primary-color-palette | the primary color used for things like buttons, spinners, etc. |
| $warn-color-palette | the color palette used for warnings within the app |
| $primary-color-palette-contrast-color | the color used for text with a `primary-color` as a background |

#### Component Styles

Each component within Angular Material has custom styles specified in its `*-theme.scss` file. For example: 

- [src/components/textField/textField-theme.scss](https://github.com/angular/material/blob/master/src/components/textField/textField-theme.scss),
- [src/components/tabs/tabs-theme.scss](https://github.com/angular/material/blob/master/src/components/tabs/tabs-theme.scss),
- [src/components/slider/slider-theme.scss](https://github.com/angular/material/blob/master/src/components/slider/slider-theme.scss),
- etc.

These component-specific styles are concatenated with **variables.scss** and **color-palettes.scss** to generate `/themes/default-theme.scss`.
Additionally, each custom theme file in `/themes/*.scss` overrides the variables from default-theme and compiles as css to `/dist/themes/`.

#### JavaScript Features

Angular Material uses both an `md-theme` directive and an `$mdTheming` service to provide JavaScript support for theming.

- `md-theme` is a directive that will set and watch the element's theme so all children elements can easily inherit the styles.
- `$mdTheming` is an internal service that registers an element as 'themable': it can inherit the theme from parent elements.

`$mdTheming` will look up the DOM for the nearest parent with an `md-theme` attribute, and add that parent's theme class to its own element.


- - -

Here is an **simple** directive that uses **$mdTheming** to add theming support within its feature set:

<hljs lang="js">
app.directive('simpleDirective', function($mdTheming) {
  return {
    template: '<h1>Hello world</h1>',
    link: function(scope, element, attr) {
      $mdTheming(element);
	  // Other features go here...
    }
  }
});
</hljs>

Here is an example of using the **simple-directive** and themes in the HTML:

<hljs lang="html">
<div id="myForm" md-theme="green">
  <simple-directive></simple-directive>
</div>
</hljs>

At runtime, both the elements **div#myForm** and **simple-directive** will now have a `class="md-green-theme"` attribute. And if we want to override a child element as shown below:


<hljs lang="html">
<div id="myForm" md-theme="green">
  <simple-directive md-theme="yellow"></simple-directive>
</div>
</hljs>

At runtime, the elements **div#myForm** will have a `class="md-green-theme"` attribute and the element **simple-directive** will now have a `class="md-yellow-theme"` attribute.

