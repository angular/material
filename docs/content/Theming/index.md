@ngdoc content
@name Theming in Angular Material
@description
# Theming in Angular Material

## Using Themes

Theming in Angular-Material is available on most components. To select a theme you may use the `md-theme` attribute on either a container element, or a specific element.

A component will always use the theme specified by its closest parent node (or itself). If no theme is specified, the `default` theme will be used.

Theme on a container:
```html
<div md-theme="green">
  <md-text-float ng-model="user.name" label="Name" />
</div>
```

Theme on a specific element

```html
<div>
  <md-text-float ng-model="user.name" label="Name" md-theme="indigo" />
</div>
```

## Installing Themes

Temporarily, themes can only be added by generating them yourself and then adding the generated `css` files to your project. This will be improved in later versions of angular-material.

Compiled themes can be found in the `dist/themes/` folder, after running `gulp build`.

You must add any theme's stylesheet that you want to use in your app. ie. if your app uses theme's `green`, `red`, and `indigo`, you must install all of them.

## Building Your Own Themes

Angular-Material uses `scss` variable overrides to generate `css` files for a given theme.

### Color Palette

Material design has a [color palette](http://www.google.com/design/spec/style/color.html#color-ui-color-palette) that helps ensure that your app feels bold and fits in with material design standards.

You can see the color palette implemented as `scss maps` in [color-palette.scss](https://github.com/angular/material/blob/master/src/core/style/color-palette.scss). You can access these colors by using standard `scss` syntax for accessing variables.

```scss
body {
  background-color: map-get($color-red, '500');
}
```

### Theme Variables

Most components' colors are derived from variables found in [variables.scss](https://github.com/angular/material/blob/master/src/core/style/variables.scss). By overriding these variables you can generate your own themes.

Some guidelines for the variables found in `variables.scss`:

- `$theme-name` - the name of the theme, by which we can use the `md-theme` attribute to use it.
- `$dark-theme` - boolean indicating whether or not the theme is a **dark** theme. Used for things like adding drop shadows to text, higher contrast colors, etc.

- `$foreground-color-palette` - the color palette used for foreground colors (such as text, hints, and dividers)

    - `$foreground-base-color` - the from which foreground colors are derived.
    - `$foreground-primary-color` - color used for text
    - `$foreground-secondary-color` - color used for secondary text and icons
    - `$foreground-tertiary-color` - color used for hints
    - `$foreground-quaternary-color` - color used for dividers


- `$background-color-palette` - the color palette used to determine the background color

- `$background-color-base` - the background color

- `$primary-color-palette` - the primary color used for things like buttons, spinners, etc.
- `$warn-color-palette` - the color palette used for warnings within the app
- `$primary-color-palette-contrast-color` - the color used for text with a `primary-color` as a background.


### Example Simple Theme

Using the above, we are able to generate the basic color variations of angular-material. For example, the indigo theme is only two lines:

```scss
$theme-name: 'indigo';
$primary-color-palette: $color-indigo;
```


### Default Theme

The [default theme](https://github.com/angular/material/blob/master/themes/default-theme.scss) is auto-generated from the `-theme.scss` suffixed files in the appropriate service or component folders.

These files expose variables that are usually derived from the [variables.scss](https://github.com/angular/material/blob/master/src/core/style/variables.scss) file mentioned above. If you want more control, you may override a specific variable in the theme.

For example:

```scss
$button-primary-color-palette: $color-green;
$button-rimary-raised-color: yellow;
```

### Building your own Theme

Most of the time, you should use the themes provided by angular-material and the `md-theme` directive for your theming needs. That being said, sometimes you need your own brand colors, etc, in which case you can build and compile your own theme.

To build your own theme, you must write a `scss` file that overrides the specific variables that you want to use, place that file in `themes/my-theme.scss` and then run the `gulp build-theme -t my-theme`. Ultimately this will be a separate gulp plugin.

For example:

```scss
$theme-name: 'my-custom-theme';
$primary-color-palette: $color-indigo;
$background-color-base: #333;
$checkbox-color-palette: $color-pink;
```

Then, take the generated theme file in `dist/themes/my-theme.css`.
